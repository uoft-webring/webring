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

type Where = "before-script" | "body" | "mount" | "waiting" | null;
type Run = { where: Where; host?: FakeNode; ready: () => void };
type Options = {
    place?: "body" | "head";
    /** document.readyState when the script runs */
    loading?: boolean;
    /** The page has a [data-uoft-webring] element; "filled" already holds a widget */
    mount?: "empty" | "filled";
};

/** Runs public/embed.js against a minimal DOM (with Shadow DOM, like real browsers). */
function run(attrs: Record<string, string>, { place = "body", loading = false, mount }: Options = {}): Run {
    const node = (tag: string): FakeNode & Record<string, unknown> => {
        const n: FakeNode & Record<string, unknown> = { tag, attrs: {}, children: [], textContent: "" };
        n.setAttribute = (key: string, value: string) => void (n.attrs[key] = value);
        n.getAttribute = (key: string) => n.attrs[key] ?? null;
        n.appendChild = (child: FakeNode) => void n.children.push(child);
        n.attachShadow = () => (n.shadow = node("#shadow-root"));
        n.querySelector = (selector: string) =>
            n.children.find((child) => `[${Object.keys(child.attrs)[0]}]` === selector) ?? null;
        return n;
    };
    const result: Run = { where: null, ready: () => {} };
    const head = node("head");
    const body = node("body");
    body.appendChild = (child: FakeNode) => void ((result.where = "body"), (result.host = child));
    const spot = node("span");
    spot.attrs["data-uoft-webring"] = "";
    if (mount === "filled")
        spot.children.push(node("span"), { ...node("span"), attrs: { "data-uoft-webring-widget": "" } });
    spot.appendChild = (child: FakeNode) => void ((result.where = "mount"), (result.host = child));
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
        body,
        readyState: loading ? "loading" : "complete",
        querySelector: (selector: string) => (mount && selector === "[data-uoft-webring]" ? spot : null),
        addEventListener: (event: string, listener: () => void) => {
            expect(event).toBe("DOMContentLoaded");
            result.where = "waiting";
            result.ready = () => {
                document.readyState = "interactive";
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
        const { where, host } = run({ "data-id": "3" }, { place: "head" });
        expect(where).toBe("body");
        expect(links(host)[0]).toBe("https://uoftwebring.com/redirect?nav=prev&id=3");
    });

    it("waits for the whole document while the page is still parsing, wherever the tag sits", () => {
        for (const place of ["head", "body"] as const) {
            const result = run({ "data-id": "3" }, { place, loading: true });
            expect(result.where).toBe("waiting");
            result.ready();
            expect(result.where).toBe(place === "head" ? "body" : "before-script");
        }
    });

    it("renders into a [data-uoft-webring] mount point when the page has one", () => {
        for (const place of ["head", "body"] as const) {
            const { where, host } = run({ "data-id": "4" }, { place, mount: "empty" });
            expect(where).toBe("mount");
            expect(links(host)[3]).toBe("https://uoftwebring.com/redirect?nav=next&id=4");
        }
        const late = run({ "data-id": "4" }, { place: "head", loading: true, mount: "empty" });
        late.ready();
        expect(late.where).toBe("mount");
    });

    it("doesn't render twice into a mount point that already has the widget", () => {
        expect(run({ "data-id": "4" }, { mount: "filled" }).where).toBeNull();
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
