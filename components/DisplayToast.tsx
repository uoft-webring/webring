"use client";
import { useEffect } from "react";
import { toast } from "sonner";

type ToastTriggerProps = {
    messageType: "warning" | "error" | "success";
    message: string;
};

export default function ToastTrigger({ messageType, message }: ToastTriggerProps) {
    useEffect(() => {
        toast[messageType](message, {
            duration: 999999,
            closeButton: true,
            position: "top-right",
        });
    }, [messageType, message]);

    return null;
}
