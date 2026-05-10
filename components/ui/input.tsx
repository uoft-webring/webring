import * as React from "react";

import { cn } from "@/lib/cn";

function Input({ error, className, type, id, ...props }: { error?: string } & React.ComponentProps<"input">) {
    const errorId = error && id ? `${id}-error` : undefined;
    return (
        <>
            <input
                type={type}
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={errorId}
                className={cn(
                    "border-input bg-transparent-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-xl border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    error && "border-destructive",
                    className
                )}
                {...props}
            />
            {error && (
                <p id={errorId} role="alert" className="text-destructive -mt-2 mb-2">
                    {error}
                </p>
            )}
        </>
    );
}

export { Input };
