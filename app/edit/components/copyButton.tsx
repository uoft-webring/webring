"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useState } from "react";
import copyIcon from "@/icons/copy.svg";
import { CheckIcon } from "lucide-react";
import copy from "copy-to-clipboard";

export default function CopyButton({ codeString }: { codeString: string }) {
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
            className="absolute top-2 right-2"
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
