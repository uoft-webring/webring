"use client";

import { useState } from "react";
import type { DeliveryCounts } from "@/lib/email/campaigns";
import { sendBatch } from "./actions";

export type SendingState = {
    running: boolean;
    counts: DeliveryCounts | null;
    error: string | null;
    /** Sends batch after batch until the campaign is done. Resolves true when it finished. */
    run: (campaignId: string) => Promise<boolean>;
};

// Each batch is one short server action, so a long list never hits the function time limit, and
// closing the tab only pauses the campaign (the report page can resume it).
export function useSending(): SendingState {
    const [running, setRunning] = useState(false);
    const [counts, setCounts] = useState<DeliveryCounts | null>(null);
    const [error, setError] = useState<string | null>(null);

    const run = async (campaignId: string): Promise<boolean> => {
        setRunning(true);
        setError(null);
        try {
            for (;;) {
                const result = await sendBatch({ id: campaignId });
                if (result.error !== null) {
                    setError(result.error);
                    return false;
                }
                setCounts(result.data.counts);
                if (result.data.done) return true;
            }
        } catch {
            setError("Lost the connection while sending. Resume to keep going.");
            return false;
        } finally {
            setRunning(false);
        }
    };

    return { running, counts, error, run };
}

/** How far along a campaign is, for the progress bar. */
export function progressOf(counts: DeliveryCounts): { finished: number; total: number } {
    return { finished: counts.total - counts.queued - counts.sending, total: counts.total };
}
