import React from "react";
import CopyButton from "../CopyButton";

import hljs from "highlight.js/lib/core";
import xml from "highlight.js/lib/languages/xml";
import "highlight.js/styles/github-dark.css";

import { checkAddedCodeToPortfolio, getValidPortfolio } from "../actions";
import StatusCard from "@/components/StatusCard";
import RecheckButton from "../RecheckButton";
import { ExternalToast, toast } from "sonner";

export default async function Join() {
    const isValidPortfolio = await getValidPortfolio();

    // TODO-J this is a state problem, provisioning temp ID below, fetch it later!!!
    const id: number = 1;

    const codeString = `<div style="display: 'flex'; align-items: 'center'; gap: '8px'">
    <a href='https://uoftwebring.com/redirect?nav=prev&id=${id}'>←</a>
    <a href='https://uoftwebring.com' target='_blank'>
    <img
        src='https://uoftwebring.com/ring_logo.svg'
        alt='UofT Webring'
        style="width: '24px'; height: 'auto'"
    />
    </a>
    <a href='https://uoftwebring.com/redirect?nav=next&id=${id}'>→</a>
</div>`;

    const action = async () => {
        "use server";
        const result = await checkAddedCodeToPortfolio();
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

    hljs.registerLanguage("html", xml);
    const codeResult = hljs.highlight(codeString, {
        language: "html",
    }).value;

    return (
        <section>
            <h2>Join the commmunity</h2>
            <p className="mb-4">
                Copy the HTML code and paste it into your portfolio to join the
                community.
            </p>
            <div className="relative mb-6">
                <pre>
                    <code
                        className="hljs language-handlebars rounded-xl"
                        dangerouslySetInnerHTML={{
                            __html: codeResult,
                        }}
                    />
                </pre>
                <CopyButton codeString={codeString} />
            </div>
            <StatusCard
                showCTA={false}
                showButton={false}
                status={isValidPortfolio ? "connected" : "disconnected"}
            />
            {!isValidPortfolio && (
                <form action={action}>
                    <RecheckButton />
                </form>
            )}
        </section>
    );
}
