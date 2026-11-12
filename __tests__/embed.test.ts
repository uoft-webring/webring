import { readFileSync } from "node:fs";
import path from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

const source = readFileSync(path.join(__dirname, "../public/embed.js"), "utf8");

type FakeNode = { tag: string; attrs: Record<string, string>; children: FakeNode[]; textContent: string };

/** Runs public/embed.js against a minimal DOM; returns what it inserted before its own tag. */
function run(attrs: Record<string, string>): FakeNode | undefined {
    const node = (tag: string): FakeNode & Record<string, unknown> => {
        const n: FakeNode & Record<string, unknown> = { tag, attrs: {}, children: [], textContent: "" };
        n.setAttribute = (key: string, value: string) => void (n.attrs[key] = value);
        n.getAttribute = (key: string) => n.attrs[key] ?? null;
        n.appendChild = (child: FakeNode) => void n.children.push(child);
        return n;
    };
    let inserted: FakeNode | undefined;
    const script = node("script");
    Object.assign(script.attrs, attrs);
    script.src = "https://uoftwebring.com/embed.js";
    script.parentNode = { insertBefore: (n: FakeNode) => void (inserted = n) };
    runInNewContext(source, { document: { currentScript: script, createElement: node }, URL, Number });
    return inserted;
}

const links = (host: FakeNode | undefined) =>
    host?.children.find((n) => n.tag === "nav")?.children.map((a) => a.attrs.href) ?? [];

describe("public/embed.js", () => {
    it("renders prev, home, random and next links with the member's id", () => {
        expect(links(run({ "data-id": "12" }))).toEqual([
            "https://uoftwebring.com/redirect?nav=prev&id=12",
            "https://uoftwebring.com",
            "https://uoftwebring.com/redirect?nav=random&id=12",
            "https://uoftwebring.com/redirect?nav=next&id=12",
        ]);
    });

    it("renders nothing for a missing or malformed id", () => {
        expect(run({})).toBeUndefined();
        expect(run({ "data-id": "abc" })).toBeUndefined();
        expect(run({ "data-id": "-1" })).toBeUndefined();
        expect(run({ "data-id": "1.5" })).toBeUndefined();
    });

    it("uses the chosen logo colour, falling back to blue", () => {
        const logo = (attrs: Record<string, string>) =>
            run(attrs)?.children.find((n) => n.tag === "nav")?.children[1].children[0].attrs.src;
        expect(logo({ "data-id": "1", "data-color": "white" })).toBe(
            "https://uoftwebring.com/ring_logo_white.svg"
        );
        expect(logo({ "data-id": "1", "data-color": "<script>" })).toBe(
            "https://uoftwebring.com/ring_logo.svg"
        );
    });
});
