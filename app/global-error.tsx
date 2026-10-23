"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import "./globals.css";

// Replaces the root layout when it fails, so it can't rely on any app components rendering.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
    useEffect(() => {
        posthog.captureException(error, { digest: error.digest });
    }, [error]);

    return (
        <html lang="en">
            <body className="dark bg-background text-foreground antialiased">
                <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
                    <h1>The ring hit a snag.</h1>
                    <p className="text-muted-foreground">That&apos;s on us. Please head back home and try again.</p>
                    {/* Plain anchor: a full reload is the most reliable way out of a broken root layout */}
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a
                        href="/"
                        className="bg-primary text-primary-foreground rounded-md px-6 py-3 font-semibold hover:opacity-90"
                    >
                        Return home
                    </a>
                </main>
            </body>
        </html>
    );
}
