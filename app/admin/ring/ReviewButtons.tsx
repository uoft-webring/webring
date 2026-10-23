"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { reviewRingLink } from "./actions";

export function ReviewButtons({ ringId, name }: { ringId: number; name: string }): React.JSX.Element {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const decide = (decision: "approve" | "reject") => {
        startTransition(async () => {
            setError(null);
            const result = await reviewRingLink({ ringId, decision });
            if (result.error !== null) {
                setError(result.error);
                return;
            }
            router.refresh();
        });
    };

    return (
        <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
                <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => decide("reject")} aria-label={`Reject ${name}'s site`}>
                    Reject
                </Button>
                <Button type="button" size="sm" disabled={pending} onClick={() => decide("approve")} aria-label={`Approve ${name}'s site`}>
                    Approve
                </Button>
            </div>
            {error && (
                <p role="alert" className="text-destructive text-sm">
                    {error}
                </p>
            )}
        </div>
    );
}
