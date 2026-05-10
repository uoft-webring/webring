"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import posthog from "posthog-js";
import { verifyDomainOwnership } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";

export function DomainVerificationCheck({ hasDomain }: { hasDomain: boolean }): React.JSX.Element {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [message, setMessage] = useState<string | null>(null);

    const verify = () => {
        startTransition(async () => {
            setMessage(null);
            posthog.capture("domain_verification_attempted");
            const { data: verified, error } = await verifyDomainOwnership();
            if (error !== null) {
                setMessage(error);
            } else if (!verified) {
                setMessage(
                    "Verification failed. Please ensure your TXT record is correctly configured and DNS has propagated (this can take up to 48 hours)."
                );
            } else {
                posthog.capture("domain_verified");
                router.refresh();
            }
        });
    };

    return (
        <div>
            <Button className="mt-1 mb-1 w-full" type="button" onClick={verify} disabled={pending || !hasDomain}>
                {pending ? "Verifying..." : "Verify now"}
            </Button>
            {!hasDomain && <p className="text-muted-foreground mt-2 text-sm">Add your portfolio link first.</p>}
            {message && (
                <p role="alert" className="mt-2 text-sm text-red-500">
                    {message}
                </p>
            )}
        </div>
    );
}
