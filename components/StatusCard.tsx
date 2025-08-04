import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";

import { CheckCircle as Success, CircleAlert as Warning, Info as Error } from "lucide-react";

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

const statusButtonColor: Record<Status, string> = {
    connected: "bg-green-400",
    unverified: "bg-yellow-400",
    pending: "bg-yellow-400",
    disconnected: "bg-red-400",
};

const statusButtonLabel: Record<Status, string> = {
    connected: "",
    unverified: "Verify now",
    pending: "",
    disconnected: "Link now",
};

const statusLabels: Record<Status, string> = {
    connected: "Connected",
    unverified: "Unverified",
    pending: "Pending",
    disconnected: "Disconnected",
};

const statusDescriptions: Record<Status, string> = {
    connected: "Your profile has been linked and your domain has been verified. No action needed.",
    unverified:
        "Your profile has been linked, but we could not verify your domain. Click edit to learn more.",
    pending: "Your domain is being reviewed and we will provide a response shortly. No action needed.",
    disconnected:
        "Your profile has not been linked yet, and you are not connected to the ring. Edit your profile to join the ring.",
};

const statusDescriptionsWithoutCTA: Record<Status, string> = {
    connected: "Your profile has been linked and your domain has been verified. No action needed.",
    unverified: "Your profile has been linked, but we could not verify your domain.",
    pending: "Your domain is being reviewed and we will provide a response shortly. No action needed.",
    disconnected: "Your profile has not been linked yet, and you are not connected to the ring.",
};

const statusIcons: Record<Status, React.JSX.Element> = {
    connected: <Success className="size-5 mb-1 md:size-8" color="var(--color-green-400)" />,
    unverified: <Warning className="size-5 mb-1 md:size-8" color="var(--color-yellow-400)" />,
    pending: <Warning className="size-5 mb-1 md:size-8" color="var(--color-yellow-400)" />,
    disconnected: <Error className="size-5 mb-1 md:size-8" color="var(--color-red-400)" />,
};

type StatusCardProps = {
    status?: Status;
    showButton?: boolean;
    showCTA?: boolean;
};

export default function StatusCard({
    status = "connected",
    showButton = true,
    showCTA = true,
}: StatusCardProps) {
    return (
        <div className={statusCardVariants({ status })}>
            <div className="flex items-center gap-2">
                {statusIcons[status]}
                <h2>{statusLabels[status]}</h2>
            </div>
            <p>{showCTA ? statusDescriptions[status] : statusDescriptionsWithoutCTA[status]}</p>

            {status !== "connected" && showButton && (
                <Button className={`w-full mt-4 ${statusButtonColor[status]}`}>
                    <p className="text-lg font-semibold color-white">{statusButtonLabel[status]}</p>
                </Button>
            )}
        </div>
    );
}
