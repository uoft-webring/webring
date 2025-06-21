import React from "react";
import StatusCard from "@/components/statusCard";
import CopyButton from "./copyButton";
import RecheckButton from "./recheckButton";

import { UserType } from "@/utils/zod";

import hljs from "highlight.js/lib/core";
import yaml from "highlight.js/lib/languages/yaml";

import { getDomainStatus } from "../actions";

export default async function VerifySection({ user }: { user: UserType }) {
    const domainTxtRecord = "uoft-webring-" + user.id;

    hljs.registerLanguage("txt", yaml);
    const result = hljs.highlight(domainTxtRecord + domainTxtRecord, {
        language: "txt",
    }).value;

    const isVerified = await getDomainStatus();

    return (
        <>
            <h2>Verify your domain</h2>
            <p className="mb-4">
                To confirm that this domain belongs to you, add the TXT record
                shown below to your DNS records. When you're done, click “Verify
                Now.” We’ll fetch your DNS and verify the domain automatically.
            </p>
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

            {!isVerified && <RecheckButton />}
        </>
    );
}
