import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";
// import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
// import jsx from "react-syntax-highlighter/dist/cjs/languages/prism/jsx";
// SyntaxHighlighter.registerLanguage("jsx", jsx);
// import mainStyle from "react-syntax-highlighter/dist/cjs/styles/prism/dracula";
import hljs from "highlight.js/lib/core";
import xml from "highlight.js/lib/languages/xml";
import "highlight.js/styles/github-dark.css";
import CopyButton from "./copyButton";

const codeString = `<div style="display: 'flex'; align-items: 'center'; gap: '8px'">
  <a href='https://uoftwebring.vercel.app/prev?id=0'>←</a>
  <a href='https://uoftwebring.vercel.app/' target='_blank'>
    <img
      src='https://uoftwebring.vercel.app/assets/favicon.ico'
      alt='UofT Webring'
      style="width: '24px'; height: 'auto'"
    />
  </a>
  <a href='https://uoftwebring.vercel.app/next?id=0'>→</a>
</div>`;
hljs.registerLanguage("html", xml);
const result = hljs.highlight(codeString, {
    language: "html",
}).value;

export default function EditJoin() {
    return (
        <>
            <div>
                <h2>Join the commmunity</h2>
                <p className="mb-4">
                    Copy the HTML code and paste it into your portfolio to join
                    the community.
                </p>
                <div className="relative">
                    {/* <SyntaxHighlighter
                        language="jsx"
                        style={mainStyle}
                        customStyle={{
                            padding: "8px 16px",
                            borderRadius: "0.75rem",
                        }}
                        wrapLongLines
                        wrapLines
                    >
                        {codeString}
                    </SyntaxHighlighter> */}
                    {/* {res} */}
                    <pre>
                        <code
                            className="hljs language-handlebars rounded-xl"
                            dangerouslySetInnerHTML={{
                                __html: result,
                            }}
                        />
                    </pre>
                    <CopyButton codeString={codeString} />
                </div>
            </div>
            <div className="flex justify-start items-center my-4 gap-4">
                {/*  <Button variant={"secondary"} onClick={prev}>
                    Back
                </Button>
                <Link href="/dashboard">
                    <Button variant={"outline"}>Dashboard</Button>
                </Link>

                <Button onClick={next} className="ml-auto">
                    Continue
                </Button> */}
            </div>
        </>
    );
}
