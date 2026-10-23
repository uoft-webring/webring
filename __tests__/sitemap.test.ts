import { describe, expect, it, vi } from "vitest";
import type { PublicProfile } from "@/lib/profiles/types";

const profiles = vi.hoisted(() => ({ data: [] as unknown[], error: null as string | null }));
vi.mock("@/lib/profiles/queries", () => ({ getPublicProfiles: async () => profiles }));

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

const member = (ringId: number, slug: string, tags: string[], program: string | null) =>
    ({ ringId, slug, name: `Member ${ringId}`, tags, program }) as unknown as PublicProfile;

describe("sitemap", () => {
    it("lists every page once, on the canonical origin, with nothing robots.txt blocks", async () => {
        profiles.data = [
            member(1, "ada", ["React", "C++"], "Computer Science"),
            member(2, "grace", ["React"], null),
            member(3, "", ["Go"], null),
        ];
        profiles.error = null;
        const urls = (await sitemap()).map((entry) => entry.url);

        expect(new Set(urls).size).toBe(urls.length);
        for (const url of urls) expect(url).toMatch(/^https:\/\/uoftwebring\.com\//);

        expect(urls).toContain("https://uoftwebring.com/u/ada");
        expect(urls).toContain("https://uoftwebring.com/tags/c-plus-plus");
        expect(urls).toContain("https://uoftwebring.com/programs/computer-science");
        // A member without a slug has no page, so neither they nor their topics are listed
        expect(urls.some((url) => url.endsWith("/tags/go"))).toBe(false);

        const disallow = [robots().rules].flat().flatMap((rule) => [rule.disallow ?? []].flat());
        for (const url of urls) {
            const path = new URL(url).pathname;
            expect(
                disallow.some((prefix) => path.startsWith(prefix)),
                path
            ).toBe(false);
        }
    });

    it("never sends a lastmod we can't back up", async () => {
        profiles.data = [member(1, "ada", [], null)];
        for (const entry of await sitemap()) expect(entry.lastModified).toBeUndefined();
    });

    it("still lists the static pages when the profile read fails", async () => {
        profiles.data = [];
        profiles.error = "Could not load profiles.";
        const urls = (await sitemap()).map((entry) => entry.url);
        expect(urls).toContain("https://uoftwebring.com/");
        expect(urls).toContain("https://uoftwebring.com/directory");
    });
});
