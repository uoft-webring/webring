"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import copyIcon from "@/icons/copy.svg";
import checkIcon from "@/icons/clipboard-check.svg";
import Prism from "prismjs";
import prettier from "prettier/standalone";
import htmlPlugin from "prettier/plugins/html";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import "prismjs/themes/prism-tomorrow.css"; // or prism-okaidia.css, prism.css, etc.
import "prismjs/components/prism-markup";

export default function CodeSnippet({ codeString, width = "100%" }: { codeString: string; width?: string }) {
    const [copied, setCopied] = useState(false);
    const [html, setHtml] = useState("");

    useEffect(() => {
        let ignore = false;
        (async () => {
            let formatted = codeString;

            formatted = await prettier.format(codeString, {
                parser: "html",
                plugins: [htmlPlugin as any],
                tabWidth: 4,
                useTabs: false,
                semi: false,
                singleQuote: false,
            });

            if (ignore) return;
            const highlighted = Prism.highlight(formatted, Prism.languages.markup, "html");
            setHtml(highlighted);
        })();

        return () => {
            ignore = true;
        };
    }, [codeString]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    return (
        <figure
            style={{ width }}
            className={cn("bg-card text-card-foreground flex rounded-xl border shadow-sm")}
        >
            {/* We expect a hydration warning, because SSR'd client component */}
            <pre suppressHydrationWarning className="text-md flex-1 overflow-x-scroll rounded-l-xl p-4">
                <code className="language-html" dangerouslySetInnerHTML={{ __html: html }} />
            </pre>

            <div className="p-2">
                <Button
                    size="icon"
                    onClick={handleCopy}
                    className="text-md rounded-xl !bg-slate-900 !opacity-100"
                >
                    {copied ? (
                        <Image src={checkIcon} alt="Check" className="size-6 invert" width={25} height={25} />
                    ) : (
                        <Image src={copyIcon} alt="Copy" className="size-6" width={25} height={25} />
                    )}
                </Button>
            </div>
        </figure>
    );
}
