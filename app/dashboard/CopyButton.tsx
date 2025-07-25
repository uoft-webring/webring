"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRef, useState } from "react";
import copyIcon from "@/icons/copy.svg";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CopyButton({
    codeString,
    className,
    ...props
}: { codeString: string } & React.ComponentPropsWithoutRef<"button">) {
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleCopy = () => {
        if ("clipboard" in navigator) {
            // In _every_ modern browser this will not fail
            navigator.clipboard.writeText(codeString);
        }
        // TODO error handle

        setCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), 1000);
    };

    return (
        <Button
            {...props}
            className={cn("absolute top-2 right-2", className)}
            size={"icon"}
            variant={"outline"}
            onClick={handleCopy}
        >
            {copied ? (
                <CheckIcon />
            ) : (
                <Image src={copyIcon} alt="Copy" className="size-4"></Image>
            )}
        </Button>
    );
}
