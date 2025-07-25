"use client";
import { useEffect } from "react";
import { ExternalToast, toast } from "sonner";

type ToastTriggerProps = {
    messageType: "warning" | "error" | "success";
    message: string;
};

export default function ToastTrigger({
    messageType,
    message,
}: ToastTriggerProps) {
    const options: ExternalToast = {
        duration: 999999,
        closeButton: true,
        position: "top-right",
    };
    useEffect(() => {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors
        toast[messageType](message, options);
    }, [messageType, message, options]);

    return null;
}
