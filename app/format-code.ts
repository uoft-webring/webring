"use server";

import prettier from "prettier/standalone";
import htmlPlugin from "prettier/plugins/html";

export async function formatCodeAction(codeString: string): Promise<string> {
    return prettier.format(codeString, {
        parser: "html",
        plugins: [htmlPlugin as any],
        tabWidth: 4,
        useTabs: false,
        semi: false,
        singleQuote: false,
    });
}
