"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function VerifyResult({ action }: { action: () => Promise<boolean> }) {
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
                {pending ? "Verifying..." : "Verify now"}
            </Button>
            {failed && (
                <p className="mt-2 text-sm text-red-500">
                    Verification failed. Please ensure your TXT record is correctly configured and DNS has
                    propagated (this can take up to 48 hours).
                </p>
            )}
        </div>
    );
}
