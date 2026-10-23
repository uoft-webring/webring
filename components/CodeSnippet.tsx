import { highlightMarkup } from "@/lib/highlight";
import { CodeBlock } from "./CodeBlock";

export function CodeSnippet({ code }: { code: string }): React.JSX.Element {
    return <CodeBlock code={code} html={highlightMarkup(code)} />;
}
