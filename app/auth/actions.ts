"use server";

import { redirect } from "next/navigation";
import { siteUrl } from "@/lib/env";
import { clearPendingEmail, getPendingEmail, setPendingEmail } from "@/lib/pending-email";
import { getPostHogClient } from "@/lib/posthog-server";
import { fail, ok, type Result } from "@/lib/result";
import { createAdminClient, createAnonClient, createClient } from "@/lib/supabase/server";
import { emailSchema, nameSchema, otpSchema } from "@/lib/validation";

export type AuthFormState = {
    error: string | null;
    fieldErrors?: { name?: string; email?: string };
    // Echoed back so a failed submit doesn't wipe what the user typed
    values?: { name?: string; email?: string };
    sent?: boolean;
};

async function sendOtp(email: string, options: { createUser: boolean; name?: string }) {
    return createAnonClient().auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: options.createUser,
            emailRedirectTo: siteUrl("/auth/callback"),
            ...(options.name && { data: { name: options.name, domain: "" } }),
        },
    });
}

export async function requestSignUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const values = { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? "") };
    const name = nameSchema.safeParse(values.name);
    const email = emailSchema.safeParse(values.email);
    if (!name.success || !email.success) {
        return {
            error: null,
            values,
            fieldErrors: { name: name.error?.issues[0]?.message, email: email.error?.issues[0]?.message },
        };
    }

    const { data: existing } = await createAdminClient()
        .from("profile")
        .select("id")
        .eq("email", email.data)
        .maybeSingle();
    if (existing) {
        return { error: null, values, fieldErrors: { email: "Email already registered." } };
    }

    const { error } = await sendOtp(email.data, { createUser: true, name: name.data });
    if (error) {
        console.error("[auth] Sign-up OTP failed:", error.code, error.message);
        return { error: "We couldn't send your code. Please try again in a minute.", values };
    }

    await setPendingEmail(email.data);
    getPostHogClient().capture({ distinctId: email.data, event: "signup_otp_sent" });
    return { error: null, sent: true };
}

export async function requestSignIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const values = { email: String(formData.get("email") ?? "") };
    const email = emailSchema.safeParse(values.email);
    if (!email.success) {
        return { error: null, values, fieldErrors: { email: email.error.issues[0]?.message } };
    }

    const { error } = await sendOtp(email.data, { createUser: false });
    if (error) {
        // Supabase answers "Signups not allowed for otp" for unknown emails
        const unknown = error.code === "otp_disabled" || /signups not allowed/i.test(error.message);
        if (!unknown) console.error("[auth] Sign-in OTP failed:", error.code, error.message);
        return unknown
            ? { error: null, values, fieldErrors: { email: "Email not registered" } }
            : { error: "We couldn't send your code. Please try again in a minute.", values };
    }

    await setPendingEmail(email.data);
    return { error: null, sent: true };
}

export async function verifyOtp(code: string): Promise<Result<null>> {
    const token = otpSchema.safeParse(code);
    if (!token.success) return fail(token.error.issues[0].message);

    const email = await getPendingEmail();
    if (!email) return fail("Your code expired. Please request a new one.");

    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ email, token: token.data, type: "email" });
    if (error || !data.user) {
        return fail(error?.code === "otp_expired" ? "That code is invalid or has expired." : "Could not verify that code.");
    }

    await clearPendingEmail();
    getPostHogClient().capture({ distinctId: data.user.id, event: "otp_verified" });
    redirect("/dashboard/edit");
}

export async function resendOtp(): Promise<Result<null>> {
    const email = await getPendingEmail();
    if (!email) return fail("Your session expired. Please start again.");

    // Never create accounts here: sign-up must go through requestSignUp so the name is captured
    const { error } = await sendOtp(email, { createUser: false });
    if (error) {
        console.error("[auth] Resend OTP failed:", error.code, error.message);
        return fail(
            error.status === 429 ? "Please wait a minute before requesting another code." : "Could not resend the code."
        );
    }

    await setPendingEmail(email);
    return ok(null);
}

export async function signOut(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
}
