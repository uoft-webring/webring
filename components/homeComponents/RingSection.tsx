"use client";

import React, { useState } from "react";
import { ClientRing } from "./ClientRing";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function RingSection({ data }: { data: any[] }) {
    const [fullSize, setFullSize] = useState<boolean>(false);

    const toggleSize = () => {
        setFullSize((fullSize) => !fullSize);
    };

    return (
        <div
            className={cn(
                "relative max-w-svw w-full flex items-center justify-center mb-8 transition-all",
                { "h-[calc(100svh-4rem)]": fullSize },
                { "h-[calc(100svh-36rem)]": !fullSize }
            )}
        >
            <ClientRing data={data} />
            <div className="absolute bottom-0 left-[50%] translate-x-[-50%] translate-y-[50%] max-w-[85rem] w-full p-4">
                <Button size={"icon"} variant={"outline"} onClick={toggleSize}>
                    {fullSize ? (
                        <ChevronUp className="size-8" />
                    ) : (
                        <ChevronDown className="size-8" />
                    )}
                </Button>
            </div>
        </div>
    );
}
