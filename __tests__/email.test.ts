import { describe, expect, it, vi } from "vitest";
import { audienceSchema, describeAudience, EVERYONE, matchesAudience, type AudienceMember } from "@/lib/email/audience";
import { renderEmail, unknownMergeFields, type EmailRecipient } from "@/lib/email/format";
import { classifySesError, parseAddress } from "@/lib/email/transport";

vi.mock("@/lib/env", () => ({
    serverEnv: () => ({ DOMAIN_VALIDATION_SECRET_KEY: "test-secret", NEXT_PUBLIC_HOME_DOMAIN: "https://uoftwebring.com/" }),
    siteUrl: (path: string) => new URL(path, "https://uoftwebring.com/").toString(),
}));
vi.mock("@/lib/supabase/server", () => ({ createAdminClient: () => ({}) }));

const jane: EmailRecipient = { name: "Jane Doe", ringId: 7, slug: "jane-doe", domain: "https://jane.dev" };
const footer = { unsubscribeUrl: "https://uoftwebring.com/unsubscribe?m=x&t=y" };

describe("renderEmail", () => {
    it("fills merge fields in the subject, HTML and text", () => {
        const email = renderEmail({ subject: "Hi {{first_name}}", body: "Your site {{site}} is #{{ring_id}}." }, jane, footer);
        expect(email.subject).toBe("Hi Jane");
        expect(email.html).toContain("Your site jane.dev is #7.");
        expect(email.text).toContain("Your site jane.dev is #7.");
    });

    it("escapes member data so a name can't inject markup or links", () => {
        const evil = { ...jane, name: '<script>x</script> [click](https://evil.example) **b**' };
        const email = renderEmail({ subject: "s", body: "Hello {{name}}" }, evil, footer);
        expect(email.html).not.toContain("<script>");
        expect(email.html).not.toContain('href="https://evil.example"');
        expect(email.html).toContain("&lt;script&gt;");
    });

    it("renders paragraphs, lists, bold and links, with url merge fields as link targets", () => {
        const body = "First line\nsecond line\n\n- one\n- two\n\n**Bold** and [your page]({{profile_url}}) and https://example.com/x.";
        const email = renderEmail({ subject: "s", body }, jane, footer);
        expect(email.html).toContain("First line<br>second line");
        expect(email.html).toMatch(/<ul[^>]*><li>one<\/li><li>two<\/li><\/ul>/);
        expect(email.html).toContain("<strong>Bold</strong>");
        expect(email.html).toContain('href="https://uoftwebring.com/u/jane-doe"');
        expect(email.html).toContain('href="https://example.com/x"');
        expect(email.text).toContain("your page (https://uoftwebring.com/u/jane-doe)");
        expect(email.text).toContain("- one\n- two");
    });

    it("always carries the unsubscribe link and falls back for empty names", () => {
        const email = renderEmail({ subject: "s", body: "Hi {{first_name}}" }, { ...jane, name: "" }, footer);
        expect(email.html).toContain("Hi there");
        expect(email.html).toContain(footer.unsubscribeUrl.replace("&", "&amp;"));
        expect(email.text).toContain(`Unsubscribe: ${footer.unsubscribeUrl}`);
    });

    it("flags unknown merge fields", () => {
        expect(unknownMergeFields("{{frist_name}} {{name}} {{ site }}")).toEqual(["frist_name"]);
    });
});

const member: AudienceMember = {
    ringId: 7,
    ringStatus: "connected",
    domain: "https://jane.dev",
    siteDown: false,
    graduationYear: 2027,
    openToWork: true,
};

describe("audience", () => {
    it("everyone matches the empty audience", () => {
        expect(matchesAudience(member, EVERYONE)).toBe(true);
        expect(describeAudience(EVERYONE)).toBe("Every member");
    });

    it("combines filters with AND", () => {
        const audience = audienceSchema.parse({ ringStatus: ["connected"], graduationYears: [2027], site: "has_site" });
        expect(matchesAudience(member, audience)).toBe(true);
        expect(matchesAudience({ ...member, ringStatus: "pending" }, audience)).toBe(false);
        expect(matchesAudience({ ...member, graduationYear: null }, audience)).toBe(false);
        expect(matchesAudience({ ...member, domain: "" }, audience)).toBe(false);
    });

    it("site filters: no site, down", () => {
        expect(matchesAudience({ ...member, domain: "" }, audienceSchema.parse({ site: "no_site" }))).toBe(true);
        expect(matchesAudience(member, audienceSchema.parse({ site: "down" }))).toBe(false);
        expect(matchesAudience({ ...member, siteDown: true }, audienceSchema.parse({ site: "down" }))).toBe(true);
    });

    it("hand-picked ring ids restrict the list", () => {
        expect(matchesAudience(member, audienceSchema.parse({ ringIds: [1, 2] }))).toBe(false);
        expect(matchesAudience(member, audienceSchema.parse({ ringIds: [7] }))).toBe(true);
    });
});

describe("unsubscribe tokens", () => {
    it("verifies its own links and rejects tampered ones", async () => {
        const { unsubscribeUrls, verifyUnsubscribeParams } = await import("@/lib/email/unsubscribe");
        const id = "0a95f60e-dd99-4fe1-b0cb-2d87148d6032";
        const url = new URL(unsubscribeUrls(id).page);
        const params = { m: url.searchParams.get("m"), t: url.searchParams.get("t") };
        expect(verifyUnsubscribeParams(params)).toBe(id);
        expect(verifyUnsubscribeParams({ ...params, m: "14e26f1c-b357-4c59-84a6-cc24778f7661" })).toBeNull();
        expect(verifyUnsubscribeParams({ m: id, t: "x".repeat(43) })).toBeNull();
    });
});

describe("transport helpers", () => {
    it("parses From addresses", () => {
        expect(parseAddress("UofT Webring <hello@uoftwebring.com>")).toEqual({ name: "UofT Webring", email: "hello@uoftwebring.com" });
        expect(parseAddress("hello@uoftwebring.com")).toEqual({ name: "", email: "hello@uoftwebring.com" });
    });

    it("classifies SES errors so nothing that may have arrived is retried", () => {
        expect(classifySesError(Object.assign(new Error("slow down"), { name: "TooManyRequestsException" }))).toBe("failed");
        expect(classifySesError(Object.assign(new Error("bad"), { name: "BadRequestException", $metadata: { httpStatusCode: 400 } }))).toBe("rejected");
        expect(classifySesError(new Error("socket hang up"))).toBe("unknown");
    });
});
