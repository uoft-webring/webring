import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OtpForm } from "@/components/OtpForm";
import { getPendingEmail } from "@/lib/pending-email";

export const metadata: Metadata = {
    title: "Confirm sign-in",
    description: "Enter the one-time code sent to your email.",
    robots: { index: false },
};

export default async function ConfirmPage() {
    // Set by requestSignUp/requestSignIn; absent means no code was requested (or it expired)
    const email = await getPendingEmail();
    if (!email) redirect("/signin");

    return <OtpForm email={email} />;
}
