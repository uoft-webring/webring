import "server-only";
import { cookies } from "next/headers";
import { emailSchema } from "@/lib/validation";

// The email awaiting an OTP lives in an httpOnly cookie rather than the URL: it stays out of
// logs/analytics, survives `+` addresses, and stops /auth/confirm being used to probe emails.
const COOKIE = "otp_email";
// Matches the OTP lifetime (auth.email.otp_expiry), so a still-valid code is never refused
const MAX_AGE_SECONDS = 60 * 60;

export async function setPendingEmail(email: string): Promise<void> {
    (await cookies()).set(COOKIE, email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: MAX_AGE_SECONDS,
    });
}

export async function getPendingEmail(): Promise<string | null> {
    const parsed = emailSchema.safeParse((await cookies()).get(COOKIE)?.value);
    return parsed.success ? parsed.data : null;
}

export async function clearPendingEmail(): Promise<void> {
    (await cookies()).delete(COOKIE);
}
