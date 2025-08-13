"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import copyIcon from "@/icons/copy.svg";
import Prism from "prismjs";
import prettier from "prettier/standalone";
import estree from "prettier/plugins/estree";
import tsPlugin from "prettier/plugins/typescript";
import htmlPlugin from "prettier/plugins/html";
import { Button } from "./ui/button";

import "prismjs/themes/prism-tomorrow.css"; // or prism-okaidia.css, prism.css, etc.

import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markup";

type Lang = "jsx" | "html";

export default function CodeSnippet({
    codeString,
    width = "100%",
    lang = "jsx",
}: {
    codeString: string;
    width?: string;
    lang?: Lang;
}) {
    const [copied, setCopied] = useState(false);
    const [html, setHtml] = useState("");

    const grammar = useMemo(() => (lang === "html" ? Prism.languages.markup : Prism.languages.jsx), [lang]);

    useEffect(() => {
        let ignore = false;
        (async () => {
            let formatted = codeString;

            // TS parser handles JSX
            formatted = await prettier.format(codeString, {
                parser: lang === "html" ? "html" : "typescript",
                plugins: [estree as any, tsPlugin as any, htmlPlugin as any],
                tabWidth: 4,
                useTabs: false,
                semi: false,
                singleQuote: false,
                trailingComma: "es5",
            });

            if (ignore) return;
            const highlighted = Prism.highlight(formatted, grammar as any, lang);
            setHtml(highlighted);
        })();

        return () => {
            ignore = true;
        };
    }, [codeString, grammar, lang]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    return (
        <figure
            style={{ width }}
            className="relative rounded-xl border bg-card text-card-foreground shadow-sm"
        >
            <Button
                size="icon"
                variant="outline"
                onClick={handleCopy}
                className="absolute right-2 top-2 rounded-md px-2 py-1 text-xs"
            >
                {copied ? "✓" : <Image src={copyIcon} alt="Copy" className="size-4"></Image>}
            </Button>

            <pre className="rounded-xl p-4 text-md">
                <code className={`language-${lang}`} dangerouslySetInnerHTML={{ __html: html }} />
            </pre>
        </figure>
    );
}
