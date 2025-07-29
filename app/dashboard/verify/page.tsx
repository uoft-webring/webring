import React from "react";
import StatusCard from "@/components/StatusCard";
import CopyButton from "../CopyButton";
import RecheckButton from "../RecheckButton";

import hljs from "highlight.js/lib/core";
import yaml from "highlight.js/lib/languages/yaml";

import {
    checkDomainRecords,
    getDomainStatus,
    getTXTRecordValue,
} from "../actions";
import { ExternalToast, toast } from "sonner";

export default async function Verify() {
    // TODO-J this is a state problem, provisioning temp ID below, fetch it later!!!
    const id: number = 1;

    const domainTXTKey = "uoft-webring-" + id;
    const domainTXTValue = await getTXTRecordValue(String(id));

    hljs.registerLanguage("txt", yaml);
    const keyResult = hljs.highlight(domainTXTKey, {
        language: "txt",
    }).value;
    const valueResult = hljs.highlight(domainTXTValue, {
        language: "txt",
    }).value;
    const isVerified = await getDomainStatus();

    const action = async () => {
        "use server";
        const result = await checkDomainRecords();
        const options: ExternalToast = {
            position: "top-center",
        };

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
        <>
            <h2>Verify your domain</h2>
            <p className="mb-4">
                To confirm that this domain belongs to you, add the TXT record
                shown below to your DNS records. When you're done, click “Verify
                Now.” We'll fetch your DNS and verify the domain automatically.
            </p>
            <h3>Key: </h3>
            <pre className="flex items-center pl-2 pr-1 py-1 gap-2 hljs rounded-md mb-6 justify-between w-full">
                <code
                    className="rounded-xl block overflow-scroll"
                    dangerouslySetInnerHTML={{
                        __html: keyResult,
                    }}
                />
                <CopyButton codeString={domainTXTKey} className="static" />
            </pre>
            <h3>Value: </h3>
            <pre className="flex items-center pl-2 pr-1 py-1 gap-2 hljs rounded-md mb-6 justify-between w-full">
                <code
                    className="rounded-xl block overflow-scroll"
                    dangerouslySetInnerHTML={{
                        __html: valueResult,
                    }}
                />
                <CopyButton codeString={domainTXTKey} className="static" />
            </pre>
            <StatusCard
                status={isVerified ? "connected" : "unverified"}
                showButton={false}
                showCTA={false}
            />

            {!isVerified && (
                <form action={action}>
                    <RecheckButton />
                </form>
            )}
        </>
    );
}
