"use client";
import { CopyBlock } from "react-code-blocks";

export default function CodeSnippet({ codeString }: { codeString: string }) {
    return (
        <CopyBlock
            text={codeString}
            language="html"
            showLineNumbers={true}
            customStyle={{
                width: "100%",
                height: "100%",
                borderRadius: "0.5rem",
                padding: "1rem",
                overflow: "hidden",
            }}
            theme={AmansTheme}
            highlight="1-11"
            /*   codeBlock={true} */
        />
    );
}

const AmansTheme = {
    lineNumberColor: `#5f6671`,
    lineNumberBgColor: `#1c1d21`,
    backgroundColor: `#0D1117`,
    textColor: `#c0c5ce`, // default text
    substringColor: `#c0c5ce`, // fallback/default
    keywordColor: `#5ebfcc`, // `style`, `href`, `src`, `target`
    attributeColor: `#f0c674`, // inline `display`, `align-items`, etc.
    selectorAttributeColor: `#5ebfcc`, // same as keywordColor
    docTagColor: `#c0c5ce`,
    nameColor: `#9cdcfe`, // tag names like `div`, `a`, `img`
    builtInColor: `#dcdcaa`,
    literalColor: `#dcdcaa`,
    bulletColor: `#dcdcaa`,
    codeColor: `#c0c5ce`,
    additionColor: `#b5cea8`,
    regexpColor: `#ce9178`,
    symbolColor: `#5ebfcc`,
    variableColor: `#d4d4d4`,
    templateVariableColor: `#d4d4d4`,
    linkColor: `#dcdcaa`, // external URL strings
    selectorClassColor: `#9cdcfe`,
    typeColor: `#4ec9b0`,
    stringColor: `#ce9178`, // strings in quotes
    selectorIdColor: `#4ec9b0`,
    quoteColor: `#ce9178`,
    templateTagColor: `#c586c0`,
    deletionColor: `#f44747`,
    titleColor: `#4ec9b0`,
    sectionColor: `#4ec9b0`,
    commentColor: `#6a9955`, // not in screenshot, assumed standard
    metaKeywordColor: `#569cd6`,
    metaColor: `#dcdcaa`,
    functionColor: `#dcdcaa`,
    numberColor: `#b5cea8`,
};
