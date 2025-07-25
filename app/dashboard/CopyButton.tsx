"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useState } from "react";
import copyIcon from "@/icons/copy.svg";
import { CheckIcon } from "lucide-react";
import copy from "copy-to-clipboard";
import { cn } from "@/lib/utils";

export default function CopyButton({
    codeString,
    className,
    ...props
}: { codeString: string } & React.ComponentPropsWithoutRef<"button">) {
    const [renderCheck, setRenderCheck] = useState(false);

    const copyText = async () => {
        if ("clipboard" in navigator) {
            await navigator.clipboard.writeText(codeString);
        } else {
            copy(codeString);
        }
        setRenderCheck(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setRenderCheck(false);
    };

    return (
        <Button
            {...props}
            className={cn("absolute top-2 right-2", className)}
            size={"icon"}
            variant={"outline"}
            onClick={copyText}
        >
            {renderCheck ? (
                <CheckIcon />
            ) : (
                <Image src={copyIcon} alt="Copy" className="size-4"></Image>
            )}
        </Button>
    );
}
