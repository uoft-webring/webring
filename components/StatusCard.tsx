import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { cn } from "@/lib/cn";

const statusCardVariants = cva("my-2 px-6 py-3 rounded-lg flex flex-col border-2", {
    variants: {
        status: {
            connected: "bg-green-300/20 border-green-400",
            unverified: "bg-yellow-300/20 border-yellow-400",
            pending: "bg-yellow-300/20 border-yellow-400",
            disconnected: "bg-red-300/20 border-red-400",
        },
    },
    defaultVariants: {
        status: "connected",
    },
});

export type Status = NonNullable<VariantProps<typeof statusCardVariants>["status"]>;

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
    connected: <CircleCheck className="mb-1 size-5 md:size-8" color="var(--color-green-400)" aria-hidden />,
    unverified: <CircleAlert className="mb-1 size-5 md:size-8" color="var(--color-yellow-400)" aria-hidden />,
    pending: <CircleAlert className="mb-1 size-5 md:size-8" color="var(--color-yellow-400)" aria-hidden />,
    disconnected: <Info className="mb-1 size-5 md:size-8" color="var(--color-red-400)" aria-hidden />,
};

export function StatusCard({
    status,
    className,
}: {
    status: Status;
    className?: string;
}): React.JSX.Element {
    return (
        <div role="status" className={cn(statusCardVariants({ status }), "rounded-xl", className)}>
            <div className="flex items-center gap-2">
                {statusIcons[status]}
                <h2>{statusLabels[status]}</h2>
            </div>
            <p>{statusDescriptions[status]}</p>
        </div>
    );
}
