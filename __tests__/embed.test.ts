import { readFileSync } from "node:fs";
import path from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

const source = readFileSync(path.join(__dirname, "../public/embed.js"), "utf8");

type FakeNode = {
    tag: string;
    attrs: Record<string, string>;
    children: FakeNode[];
    textContent: string;
    shadow?: FakeNode;
};

type Run = { where: "before-script" | "body" | "waiting" | null; host?: FakeNode; ready: () => void };

/** Runs public/embed.js against a minimal DOM (with Shadow DOM, like real browsers). */
function run(attrs: Record<string, string>, place: "body" | "head" | "head-before-body" = "body"): Run {
    const node = (tag: string): FakeNode & Record<string, unknown> => {
        const n: FakeNode & Record<string, unknown> = { tag, attrs: {}, children: [], textContent: "" };
        n.setAttribute = (key: string, value: string) => void (n.attrs[key] = value);
        n.getAttribute = (key: string) => n.attrs[key] ?? null;
        n.appendChild = (child: FakeNode) => void n.children.push(child);
        n.attachShadow = () => (n.shadow = node("#shadow-root"));
        return n;
    };
    const result: Run = { where: null, ready: () => {} };
    const head = node("head");
    const body = node("body");
    body.appendChild = (child: FakeNode) => void ((result.where = "body"), (result.host = child));
    const script = node("script");
    Object.assign(script.attrs, attrs);
    script.src = "https://uoftwebring.com/embed.js";
    script.parentNode =
        place === "body"
            ? { insertBefore: (n: FakeNode) => void ((result.where = "before-script"), (result.host = n)) }
            : head;
    const document = {
        currentScript: script,
        createElement: node,
        head,
        body: place === "head-before-body" ? null : body,
        addEventListener: (_event: string, listener: () => void) => {
            result.where = "waiting";
            result.ready = () => {
                document.body = body;
                listener();
            };
        },
    };
    runInNewContext(source, { document, URL });
    return result;
}

const nav = (host: FakeNode | undefined) => host?.shadow?.children.find((n) => n.tag === "nav");
const links = (host: FakeNode | undefined) => nav(host)?.children.map((a) => a.attrs.href) ?? [];

describe("public/embed.js", () => {
    it("renders prev, home, random and next links with the member's id, inside a shadow root", () => {
        const { where, host } = run({ "data-id": "12" });
        expect(where).toBe("before-script");
        expect(host?.children).toEqual([]);
        expect(host?.shadow?.children.map((n) => n.tag)).toEqual(["style", "nav"]);
        expect(links(host)).toEqual([
            "https://uoftwebring.com/redirect?nav=prev&id=12",
            "https://uoftwebring.com",
            "https://uoftwebring.com/redirect?nav=random&id=12",
            "https://uoftwebring.com/redirect?nav=next&id=12",
        ]);
    });

    it("renders nothing for a missing or malformed id", () => {
        const malformed: Record<string, string>[] = [
            {},
            { "data-id": "abc" },
            { "data-id": "-1" },
            { "data-id": "1.5" },
            { "data-id": "7 " },
        ];
        for (const attrs of malformed) {
            expect(run(attrs).where).toBeNull();
        }
    });

    it("renders at the end of <body> when the tag sits in <head> (React 19 hoists it there)", () => {
        const { where, host } = run({ "data-id": "3" }, "head");
        expect(where).toBe("body");
        expect(links(host)[0]).toBe("https://uoftwebring.com/redirect?nav=prev&id=3");
    });

    it("waits for <body> when it runs from <head> before the body exists", () => {
        const result = run({ "data-id": "3" }, "head-before-body");
        expect(result.where).toBe("waiting");
        result.ready();
        expect(result.where).toBe("body");
    });

    it("uses the chosen logo colour and format, falling back to blue SVG", () => {
        const logo = (attrs: Record<string, string>) =>
            nav(run(attrs).host)?.children[1].children[0].attrs.src;
        expect(logo({ "data-id": "1", "data-color": "white", "data-format": "png" })).toBe(
            "https://uoftwebring.com/ring_logo_white.png"
        );
        expect(logo({ "data-id": "1", "data-color": "<script>", "data-format": "gif" })).toBe(
            "https://uoftwebring.com/ring_logo.svg"
        );
    });
});
