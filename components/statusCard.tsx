import React from "react";
import Link from "next/link";
import { cva, VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";

const statusCardVariants = cva(
    "my-2 px-6 py-3 rounded-2xl flex flex-col border-2",
    {
        variants: {
            status: {
                connected: "bg-green-300/30 border-green-400",
                unverified: "bg-yellow-300/30 border-yellow-400",
                disconnected: "bg-red-300/30 border-red-400",
            },
        },
        defaultVariants: {
            status: "connected",
        },
    }
);

type Status = NonNullable<VariantProps<typeof statusCardVariants>["status"]>;

const statusDotVariants: Record<Status, string> = {
    connected: "bg-green-500",
    unverified: "bg-yellow-500",
    disconnected: "bg-red-500",
};

const statusLabels: Record<Status, string> = {
    connected: "Connected",
    unverified: "Unverified",
    disconnected: "Disconnected",
};

const statusDescriptions: Record<Status, string> = {
    connected:
        "Your profile has been linked and your domain has been verified. No action needed.",
    unverified:
        "Your profile has been linked, but we could not verify your domain. View your profile to learn more.",
    disconnected:
        "Your profile has not been linked yet, and you are not connected to the ring. Edit your profile to join the ring.",
};

type StatusCardProps = {
    status?: Status;
};

export default function StatusCard({ status = "connected" }: StatusCardProps) {
    return (
        <div className={statusCardVariants({ status })}>
            <div className="flex items-center gap-2">
                <div
                    className={`h-4 aspect-square rounded-full relative flex items-center justify-center ${statusDotVariants[status]}`}
                >
                    <div className="h-1.5 aspect-square rounded-full bg-white absolute" />
                </div>
                <h2>{statusLabels[status]}</h2>
                <Link href="/edit" className="ml-auto">
                    <Button variant="ghost" size="sm" className="px-0">
                        Edit
                    </Button>
                </Link>
            </div>
            <p>{statusDescriptions[status]}</p>
        </div>
    );
}
