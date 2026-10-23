import { describe, expect, it } from "vitest";
import { inviteCandidateSchema, inviteEmail, mentionsUofT, siteKey } from "@/lib/invites";

const candidate = {
    githubLogin: "jane-doe",
    name: "Jane Doe",
    email: "Jane@Example.com",
    website: "jane.dev",
    bio: "CS @ UofT",
};

describe("mentionsUofT", () => {
    it("matches the usual ways people write it", () => {
        for (const bio of ["CS at University of Toronto", "UofT '27", "U of T eng", "utoronto", "UTSC student"]) {
            expect(mentionsUofT(bio)).toBe(true);
        }
    });

    it("ignores lookalikes", () => {
        expect(mentionsUofT("Toronto Metropolitan University")).toBe(false);
        expect(mentionsUofT("uoftwebring fan")).toBe(false);
    });
});

describe("inviteCandidateSchema", () => {
    it("normalises email and adds a scheme to bare websites", () => {
        const parsed = inviteCandidateSchema.parse(candidate);
        expect(parsed.email).toBe("jane@example.com");
        expect(parsed.website).toBe("https://jane.dev");
    });

    it("rejects non-UofT bios, bad emails and non-http sites", () => {
        expect(inviteCandidateSchema.safeParse({ ...candidate, bio: "Waterloo CS" }).success).toBe(false);
        expect(inviteCandidateSchema.safeParse({ ...candidate, email: "nope" }).success).toBe(false);
        expect(inviteCandidateSchema.safeParse({ ...candidate, website: "javascript:alert(1)" }).success).toBe(false);
        expect(inviteCandidateSchema.safeParse({ ...candidate, githubLogin: "-bad" }).success).toBe(false);
    });

    it("only accepts public http(s) websites", () => {
        for (const website of ["ftp://x.com", "https://x.com@evil.com", "http://localhost", "https://10.0.0.1", "x"]) {
            expect(inviteCandidateSchema.safeParse({ ...candidate, website }).success, website).toBe(false);
        }
        expect(inviteCandidateSchema.parse({ ...candidate, website: "http://Jane.Dev/blog" }).website).toBe(
            "http://Jane.Dev/blog"
        );
    });

    it("truncates long names instead of dropping the candidate", () => {
        expect(inviteCandidateSchema.parse({ ...candidate, name: "x".repeat(200) }).name).toHaveLength(80);
    });
});

describe("siteKey", () => {
    it("treats www, scheme, case and paths as the same site", () => {
        expect(siteKey("https://www.Jane.dev/blog")).toBe("jane.dev");
        expect(siteKey("jane.dev")).toBe("jane.dev");
    });

    it("tells people apart on shared hosts", () => {
        expect(siteKey("https://github.com/Jane/portfolio")).toBe("github.com/jane");
        expect(siteKey("https://github.com/bob")).not.toBe(siteKey("https://github.com/jane"));
        expect(siteKey("https://linktr.ee/")).toBeNull();
    });

    it("returns null for garbage", () => {
        expect(siteKey("")).toBeNull();
    });
});

describe("inviteEmail", () => {
    const links = { join: "https://uoftwebring.com/signup", site: "https://uoftwebring.com/", unsubscribe: "https://uoftwebring.com/unsubscribe?a=1&b=2" };

    it("names their site, says where we found them, and links to unsubscribe", () => {
        const email = inviteEmail({ name: "Jane Doe", website: "https://www.jane.dev/" }, links);
        expect(email.text).toContain("Hi Jane,");
        expect(email.text).toContain("jane.dev through your GitHub profile");
        expect(email.text).toContain("public GitHub profile");
        expect(email.html).toContain("unsubscribe?a=1&amp;b=2");
    });

    it("escapes names in HTML", () => {
        expect(inviteEmail({ name: "<b>x</b>", website: "https://a.dev" }, links).html).not.toContain("<b>x");
    });
});
