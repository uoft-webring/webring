"use client";

import Image from "next/image";
import { useState } from "react";
import "prismjs/themes/prism-tomorrow.css";
import checkIcon from "@/icons/clipboard-check.svg";
import copyIcon from "@/icons/copy.svg";
import { Button } from "./ui/button";

/** Pre-highlighted code (see lib/highlight.ts) with a copy button. */
export function CodeBlock({ code, html }: { code: string; html: string }): React.JSX.Element {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    return (
        <figure className="bg-card text-card-foreground flex w-full rounded-xl border shadow-sm">
            <pre className="text-md flex-1 overflow-x-auto rounded-l-xl p-4">
                {/* html comes from Prism on the server, which escapes the source */}
                <code className="language-html" dangerouslySetInnerHTML={{ __html: html }} />
            </pre>

            <div className="p-2">
                <Button
                    size="icon"
                    onClick={copy}
                    aria-label={copied ? "Copied" : "Copy code"}
                    className="text-md rounded-xl !bg-slate-900 !opacity-100"
                >
                    <Image
                        src={copied ? checkIcon : copyIcon}
                        alt=""
                        className={copied ? "size-6 invert" : "size-6"}
                        width={25}
                        height={25}
                    />
                </Button>
                <span className="sr-only" aria-live="polite">
                    {copied ? "Copied to clipboard" : ""}
                </span>
            </div>
        </figure>
    );
}
