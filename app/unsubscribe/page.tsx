import type { Metadata } from "next";
import Link from "next/link";
import { isSubscribed, verifyUnsubscribeParams } from "@/lib/email/unsubscribe";
import { SubscriptionForm } from "./SubscriptionForm";

export const metadata: Metadata = { title: "Email preferences", robots: { index: false } };

// Opening the link only shows this page: link scanners in mail clients fetch every URL in an email,
// so unsubscribing takes a press of the button (mail clients' one-click unsubscribe POSTs to
// /api/email/unsubscribe instead).
export default async function UnsubscribePage({ searchParams }: PageProps<"/unsubscribe">) {
    const params = await searchParams;
    const m = typeof params.m === "string" ? params.m : "";
    const t = typeof params.t === "string" ? params.t : "";
    const profileId = verifyUnsubscribeParams({ m, t });

    return (
        <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center px-6 py-16">
            <h1 className="mb-6">Email preferences</h1>
            {profileId ? (
                <SubscriptionForm m={m} t={t} initiallySubscribed={await isSubscribed(profileId)} />
            ) : (
                <p>This link isn&apos;t valid. Use the unsubscribe link from your most recent UofT Webring email.</p>
            )}
            <p className="text-muted-foreground mt-10 text-sm">
                <Link href="/" className="underline underline-offset-4">
                    Back to the UofT Webring
                </Link>
            </p>
        </main>
    );
}
