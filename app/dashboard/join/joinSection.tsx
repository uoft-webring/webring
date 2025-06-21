import React from "react";
import CopyButton from "../copyButton";

import hljs from "highlight.js/lib/core";
import xml from "highlight.js/lib/languages/xml";
import "highlight.js/styles/github-dark.css";

import { checkAddedCodeToPortfolio, getValidPortfolio } from "../actions";
import StatusCard from "@/components/statusCard";
import RecheckButton from "../recheckButton";
import { ExternalToast, toast } from "sonner";
import { isValid } from "zod";

export default async function JoinSection({ id }: { id: number }) {
    const isValidPortfolio = await getValidPortfolio();
    const codeString = `<div style="display: 'flex'; align-items: 'center'; gap: '8px'">
    <a href='https://uoftwebring.vercel.app/prev?id=${id}'>←</a>
    <a href='https://uoftwebring.vercel.app/' target='_blank'>
    <img
        src='https://uoftwebring.vercel.app/assets/favicon.ico'
        alt='UofT Webring'
        style="width: '24px'; height: 'auto'"
    />
    </a>
    <a href='https://uoftwebring.vercel.app/next?id=${id}'>→</a>
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
            <div className="relative mb-4">
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
