"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { useFormStatus } from "react-dom";

export default function RecheckButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="mt-1 w-full" type="submit" disabled={pending}>
            Verify now
        </Button>
    );
}
