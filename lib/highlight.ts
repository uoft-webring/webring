import "server-only";
import Prism from "prismjs";
import "prismjs/components/prism-markup";

/** Prism-highlighted HTML for a markup snippet. Runs on the server so Prism never ships to the client. */
export function highlightMarkup(code: string): string {
    return Prism.highlight(code, Prism.languages.markup, "markup");
}
