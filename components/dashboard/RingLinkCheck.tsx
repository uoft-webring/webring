"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { checkRingLink } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";

export function RingLinkCheck({ hasDomain }: { hasDomain: boolean }): React.JSX.Element {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

    const check = () => {
        startTransition(async () => {
            setMessage(null);
            const { data, error } = await checkRingLink();
            if (error !== null) {
                setMessage({ text: error, isError: true });
                return;
            }
            setMessage({ text: data.message, isError: false });
            router.refresh();
        });
    };

    return (
        <div>
            <Button className="mt-1 mb-1 w-full" type="button" onClick={check} disabled={pending || !hasDomain}>
                {pending ? "Checking your site..." : "Check my site"}
            </Button>
            {!hasDomain && <p className="text-muted-foreground mt-2 text-sm">Add your portfolio link first.</p>}
            {message && (
                <p role={message.isError ? "alert" : "status"} className={message.isError ? "mt-2 text-sm text-red-500" : "mt-2 text-sm"}>
                    {message.text}
                </p>
            )}
        </div>
    );
}
