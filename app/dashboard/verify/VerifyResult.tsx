"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

type VerifyResultProps = {
    action: () => Promise<boolean>;
    buttonLabel?: string;
    failureMessage?: string;
};

export default function VerifyResult({
    action,
    buttonLabel = "Verify now",
    failureMessage = "Verification failed. Please ensure your TXT record is correctly configured and DNS has propagated (this can take up to 48 hours).",
}: VerifyResultProps) {
    const [pending, setPending] = useState(false);
    const [failed, setFailed] = useState(false);

    const handleSubmit = async () => {
        setPending(true);
        setFailed(false);
        try {
            const result = await action();
            // If we get here (no redirect), verification failed
            if (!result) {
                setFailed(true);
            }
        } catch {
            // redirect() throws NEXT_REDIRECT — that's expected on success
        } finally {
            setPending(false);
        }
    };

    return (
        <div>
            <Button className="mt-1 mb-1 w-full" type="button" onClick={handleSubmit} disabled={pending}>
                {pending ? "Verifying..." : buttonLabel}
            </Button>
            {failed && <p className="mt-2 text-sm text-red-500">{failureMessage}</p>}
        </div>
    );
}
