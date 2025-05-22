import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({
    error,
    remaining,
    className,
    ...props
}: {
    error: string | undefined;
    remaining: number;
} & React.ComponentProps<"textarea">) {
    return (
        <>
            <div className="relative">
                <textarea
                    data-slot="textarea"
                    className={cn(
                        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        error &&
                            "border-destructive focus:border-destructive focus-visible:border-destructive",
                        className
                    )}
                    {...props}
                />
                <p
                    className={cn(
                        "absolute bottom-3 right-3 text-muted",
                        remaining < 16 ? "text-destructive" : ""
                    )}
                >
                    {remaining.toString()}
                </p>
            </div>
            {error && <p className="text-destructive mb-2 mt-2">{error}</p>}
        </>
    );
}

export { Textarea };
