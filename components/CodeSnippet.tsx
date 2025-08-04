"use client";
import { CopyBlock } from "react-code-blocks";

export default function CodeSnippet({ codeString, width = "100%" }: { codeString: string; width?: string }) {
    return (
        <CopyBlock
            text={codeString}
            language={"html"}
            showLineNumbers={false}
            customStyle={{
                width: width,
                borderRadius: "0.75rem",
                padding: "1rem",
                overflowX: "scroll",
            }}
            theme={AmansTheme}
        />
    );
}

const AmansTheme = {
    backgroundColor: `#0d1117`,
    textColor: `#9DCBF4`,
    substringColor: `#c0c5ce`,
    keywordColor: `#79c0ff`, // `style`, `href`, `src`, `target`
    attributeColor: `#79c0ff`, // inline `display`, `align-items`, etc.
    selectorAttributeColor: `#5ebfcc`,
    docTagColor: `#c0c5ce`,
    nameColor: `#9cdcfe`,
    builtInColor: `#6AC273`,
    literalColor: `#dcdcaa`,
    bulletColor: `#dcdcaa`,
    codeColor: `#c0c5ce`,
    additionColor: `#b5cea8`,
    regexpColor: `#ce9178`,
    symbolColor: `#5ebfcc`,
    variableColor: `#d4d4d4`,
    templateVariableColor: `#d4d4d4`,
    linkColor: `#9DCCF5`,
    selectorClassColor: `#9cdcfe`,
    typeColor: `#a5d6ff`,
    stringColor: `#ce9178`,
    selectorIdColor: `#a5d6ff`,
    quoteColor: `#ce9178`,
    templateTagColor: `#a5d6ff`,
    deletionColor: `#f44747`,
    titleColor: `#a5d6ff`,
    sectionColor: `#a5d6ff`,
    commentColor: `#6a9955`,
    metaKeywordColor: `#569cd6`,
    metaColor: `#dcdcaa`,
    functionColor: `#dcdcaa`,
    numberColor: `#b5cea8`,
};
