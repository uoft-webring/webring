import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Markdown } from "@/components/Markdown";

const render = (markdown: string) => renderToStaticMarkup(<Markdown>{markdown}</Markdown>);

describe("Markdown (member-written)", () => {
    it("never renders raw HTML", () => {
        const html = render('Hi <script>alert(1)</script> <img src=x onerror="alert(1)"> <iframe src="https://evil"></iframe>');
        // Shown as escaped text, never as elements
        expect(html).not.toMatch(/<(script|img|iframe)\b/i);
        expect(html).toContain("&lt;script&gt;");
    });

    it("drops dangerous link targets", () => {
        expect(render("[x](javascript:alert(1))")).not.toContain("javascript:");
        expect(render("[x](data:text/html,<script>alert(1)</script>)")).not.toContain("data:");
    });

    it("doesn't render images, which could track visitors", () => {
        expect(render("![me](https://tracker.example/pixel.png)")).not.toContain("<img");
    });

    it("marks member links as untrusted and opens them in a new tab", () => {
        const html = render("[site](https://jane.dev)");
        expect(html).toContain('href="https://jane.dev"');
        expect(html).toContain('rel="nofollow ugc noopener noreferrer"');
        expect(html).toContain('target="_blank"');
    });

    it("demotes headings under the page's own section headings", () => {
        const html = render("# Big\n\n## Bigger");
        expect(html).not.toMatch(/<h1|<h2/);
        expect(html.match(/<h3>/g)).toHaveLength(2);
    });

    it("keeps everyday formatting", () => {
        const html = render("**bold** _it_\n\n- one\n- two\n\n> quote\n\n`code`");
        for (const tag of ["<strong>", "<em>", "<ul>", "<li>", "<blockquote>", "<code>"]) expect(html).toContain(tag);
    });
});
