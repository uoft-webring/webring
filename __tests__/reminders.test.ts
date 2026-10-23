import { describe, expect, it } from "vitest";
import { missingProfileItems, reminderEmail, type ReminderRecipient } from "@/lib/reminders";

const complete: ReminderRecipient = {
    name: "Jane Doe",
    domain: "https://jane.dev",
    tagline: "Builds things",
    imageKey: "abc.avif",
    tags: ["Web"],
    ringStatus: "connected",
};
const links = { edit: "https://uoftwebring.com/dashboard/edit", profile: "https://uoftwebring.com/u/jane", unsubscribe: "https://uoftwebring.com/unsubscribe?x=1&y=2" };

describe("missingProfileItems", () => {
    it("is empty for a complete profile", () => {
        expect(missingProfileItems(complete)).toEqual([]);
    });

    it("asks for a website before the ring widget", () => {
        expect(missingProfileItems({ ...complete, domain: "", ringStatus: "disconnected" })[0]).toMatch(/website/);
        expect(missingProfileItems({ ...complete, ringStatus: "pending" })[0]).toMatch(/prev\/next/);
    });

    it("lists every missing field", () => {
        const empty = { name: "", domain: "", tagline: "", imageKey: "", tags: [], ringStatus: "disconnected" } as const;
        expect(missingProfileItems({ ...empty, tags: [] })).toHaveLength(4);
    });
});

describe("reminderEmail", () => {
    it("checks in with complete members instead of nagging", () => {
        const email = reminderEmail(complete, links);
        expect(email.subject).toMatch(/still up to date/);
        expect(email.html).not.toContain("<ul>");
        expect(email.text).toContain("Hi Jane,");
    });

    it("lists what's missing", () => {
        const email = reminderEmail({ ...complete, tagline: "" }, links);
        expect(email.subject).toMatch(/Finish/);
        expect(email.text).toContain("- Write a one-line tagline");
    });

    it("always links to unsubscribe", () => {
        const email = reminderEmail(complete, links);
        expect(email.text).toContain(links.unsubscribe);
        expect(email.html).toContain("unsubscribe?x=1&amp;y=2");
    });

    it("escapes member-supplied names in HTML", () => {
        const email = reminderEmail({ ...complete, name: "<img src=x onerror=alert(1)>" }, links);
        expect(email.html).not.toContain("<img");
        expect(email.html).toContain("&lt;img");
    });

    it("falls back when there's no name", () => {
        expect(reminderEmail({ ...complete, name: "  " }, { ...links, profile: null }).text).toContain("Hi there,");
    });
});
