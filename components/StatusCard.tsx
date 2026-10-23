import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { cn } from "@/lib/cn";

// Tinted icon chip on the shared card surface (theme tokens, not raw palette colours)
const statusIconVariants = cva("flex size-10 shrink-0 items-center justify-center rounded-full", {
    variants: {
        status: {
            connected: "bg-chart-3/15 text-chart-3",
            unverified: "bg-chart-4/15 text-chart-4",
            pending: "bg-chart-4/15 text-chart-4",
            disconnected: "bg-destructive/15 text-destructive",
        },
    },
    defaultVariants: {
        status: "connected",
    },
});

export type Status = NonNullable<VariantProps<typeof statusIconVariants>["status"]>;

const statusLabels: Record<Status, string> = {
    connected: "Connected",
    unverified: "Unverified",
    pending: "Pending",
    disconnected: "Disconnected",
};

const statusDescriptions: Record<Status, string> = {
    connected: "Your profile has been linked and your domain has been verified. No action needed.",
    unverified: "Your profile has been linked, but we could not verify your domain.",
    pending: "Your domain is being reviewed and we will provide a response shortly. No action needed.",
    disconnected: "Your profile has not been linked yet, and you are not connected to the ring.",
};

// Icons differ per status too, so state never relies on colour alone
const statusIcons: Record<Status, React.JSX.Element> = {
    connected: <CircleCheck className="size-5" aria-hidden />,
    unverified: <CircleAlert className="size-5" aria-hidden />,
    pending: <CircleAlert className="size-5" aria-hidden />,
    disconnected: <Info className="size-5" aria-hidden />,
};

/** `children` is an optional action (e.g. "Check my site") shown under the status it changes. */
export function StatusCard({
    status,
    className,
    children,
}: {
    status: Status;
    className?: string;
    children?: React.ReactNode;
}): React.JSX.Element {
    return (
        <div className={cn("bg-card flex items-start gap-4 rounded-xl border p-5", className)}>
            <span className={statusIconVariants({ status })}>{statusIcons[status]}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div role="status" className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold">{statusLabels[status]}</h3>
                    <p className="text-muted-foreground text-base">{statusDescriptions[status]}</p>
                </div>
                {children}
            </div>
        </div>
    );
}
