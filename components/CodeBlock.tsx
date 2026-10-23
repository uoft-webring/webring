"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import "prismjs/themes/prism-tomorrow.css";
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
        <figure className="bg-background/60 text-card-foreground flex w-full items-start rounded-lg border">
            <pre className="flex-1 overflow-x-auto rounded-l-lg p-4 text-sm">
                {/* html comes from Prism on the server, which escapes the source */}
                <code className="language-html" dangerouslySetInnerHTML={{ __html: html }} />
            </pre>

            <div className="p-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={copy}
                    aria-label={copied ? "Copied" : "Copy code"}
                >
                    {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
                </Button>
                <span className="sr-only" aria-live="polite">
                    {copied ? "Copied to clipboard" : ""}
                </span>
            </div>
        </figure>
    );
}
