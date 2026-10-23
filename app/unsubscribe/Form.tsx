"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { unsubscribe } from "./actions";

export function UnsubscribeForm({ params }: { params: { kind: string; id: string; token: string } }): React.JSX.Element {
    const [result, action, pending] = useActionState(unsubscribe, null);

    if (result?.error === null) {
        return (
            <p role="status" className="text-center">
                You&apos;re unsubscribed. We won&apos;t email you again.
            </p>
        );
    }

    return (
        <form action={action} className="flex flex-col gap-3">
            {Object.entries(params).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
            ))}
            <Button type="submit" disabled={pending}>
                {pending ? "Unsubscribing..." : "Unsubscribe"}
            </Button>
            {result?.error && (
                <p role="alert" className="text-sm text-red-500">
                    {result.error}
                </p>
            )}
        </form>
    );
}
