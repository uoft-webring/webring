"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { checkDomainRecords } from "../actions";
import { ExternalToast, toast } from "sonner";

export default function RecheckButton() {
    const handleFetch = async () => {
        const result = await checkDomainRecords();
        const options: ExternalToast = { position: "top-center" };

        if (result) {
            toast.success("Domain verified successfully!", options);
        } else {
            toast.error(
                "Domain verification failed. Please try again.",
                options
            );
        }
    };

    return (
        <Button className="mt-4 w-full" onClick={handleFetch}>
            Verify now
        </Button>
    );
}
