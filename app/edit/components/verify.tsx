"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import CopyButton from "./copyButton";
import StatusCard from "@/components/statusCard";
import { toast } from "sonner";

import hljs from "highlight.js/lib/core";
import yaml from "highlight.js/lib/languages/yaml";

export default function EditVerify({
    domainTxtRecord,
}: {
    domainTxtRecord: string;
}) {
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [isVerified, setIsVerified] = useState<boolean>(false);

    hljs.registerLanguage("txt", yaml);
    const result = hljs.highlight(domainTxtRecord + domainTxtRecord, {
        language: "txt",
    }).value;

    const handleFetch = async () => {
        setIsFetching(true);
        // Handle fetching here
        const result: boolean = await new Promise((resolve) =>
            setTimeout(() => {
                resolve(true);
                // resolve(false);
            }, 1000)
        );

        if (result === true) {
            setIsVerified(true);
            toast.success(
                "Verification successful. Your domain has been verified.",
                { duration: 3000 }
            );
        } else {
            toast.error(
                "Could not verify your domain. If you have already modified your domain's DNS records, please try again later.",
                { duration: 5000 }
            );
        }
        setIsFetching(false);
    };
    return (
        <>
            <h2>Verify your domain</h2>
            <p className="mb-4">
                To confirm that this domain belongs to you, add the TXT record
                shown below to your DNS records. When you're done, click “Verify
                Now.” We’ll fetch your DNS and verify the domain automatically.
            </p>

            {/* <div className="flex items-center justify-center px-3 py-2 border-white/10 border-2 rounded-lg bg-[#282a36] mb-4">
                <div className="flex grow mr-2 font-mono">
                    {domainTxtRecord}
                </div>
                <CopyButton codeString={domainTxtRecord} className="static" />
                </div> */}
            <pre className="flex items-center pl-2 pr-1 py-1 gap-2 hljs rounded-md mb-4">
                <code
                    className="rounded-xl block overflow-scroll"
                    dangerouslySetInnerHTML={{
                        __html: result,
                    }}
                />
                <CopyButton codeString={domainTxtRecord} className="static" />
            </pre>

            <StatusCard
                status={isVerified ? "connected" : "unverified"}
                showButton={false}
                showCTA={false}
            />

            {!isVerified && (
                <Button
                    className="mt-4 w-full"
                    disabled={isFetching}
                    onClick={handleFetch}
                >
                    Verify now
                </Button>
            )}
        </>
    );
}
