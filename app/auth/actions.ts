"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { siteUrl } from "@/lib/env";
import { clearPendingEmail, getPendingEmail, setPendingEmail } from "@/lib/pending-email";
import { getPostHogClient } from "@/lib/posthog-server";
import { allowOtpSend, allowOtpVerify } from "@/lib/rate-limit";
import { fail, ok, type Result } from "@/lib/result";
import { createAdminClient, createAnonClient, createClient } from "@/lib/supabase/server";
import { emailSchema, nameSchema, otpSchema } from "@/lib/validation";

const SEND_LIMIT_MESSAGES = {
    inbox: "Too many codes requested. Please try again in an hour.",
    client: "Too many requests from your network. Please try again later.",
} as const;

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

    // Before the lookup, so this also throttles probing which emails are registered
    const sendLimit = await allowOtpSend(email.data);
    if (sendLimit !== "ok") return { error: SEND_LIMIT_MESSAGES[sendLimit], values };

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
    // Not keyed by email (private); the account doesn't exist yet, so skip creating a person
    getPostHogClient().capture({
        distinctId: randomUUID(),
        event: "signup_otp_sent",
        properties: { $process_person_profile: false },
    });
    return { error: null, sent: true };
}

export async function requestSignIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const values = { email: String(formData.get("email") ?? "") };
    const email = emailSchema.safeParse(values.email);
    if (!email.success) {
        return { error: null, values, fieldErrors: { email: email.error.issues[0]?.message } };
    }

    const sendLimit = await allowOtpSend(email.data);
    if (sendLimit !== "ok") return { error: SEND_LIMIT_MESSAGES[sendLimit], values };

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
    if (!(await allowOtpVerify(email))) {
        return fail("Too many attempts. Please wait 15 minutes and try again.");
    }

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
    const sendLimit = await allowOtpSend(email);
    if (sendLimit !== "ok") return fail(SEND_LIMIT_MESSAGES[sendLimit]);

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
