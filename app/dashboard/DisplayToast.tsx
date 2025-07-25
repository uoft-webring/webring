"use client";
import { useEffect } from "react";
import { ExternalToast, toast } from "sonner";

export default function ToastTrigger({
    messageType,
    message,
}: {
    messageType: "warning" | "error" | "success";
    message: string;
}) {
    const options: ExternalToast = {
        duration: 999999,
        closeButton: true,
        position: "top-right",
    };
    useEffect(() => {
        if (messageType === "error") {
            toast.error(message, options);
        } else if (messageType === "warning") {
            toast.warning(message, options);
        } else if (messageType === "success") {
            toast.success(message, options);
        }
    }, []);

    return null;
}
