import { describe, expect, it } from "vitest";
import { experienceRange, formatMonth, sortExperience } from "@/lib/profiles/experience";
import { pageContentSchema, type Experience } from "@/lib/validation";

const role = (start: string, end: string, name = start): Experience => ({
    role: name,
    organization: "Org",
    start,
    end,
    description: "",
});

describe("formatMonth", () => {
    it("formats without timezone drift", () => {
        expect(formatMonth("2024-09")).toBe("Sep 2024");
        expect(formatMonth("2025-01")).toBe("Jan 2025");
    });

    it("shows ongoing roles as Present", () => {
        expect(experienceRange(role("2024-09", ""))).toBe("Sep 2024 – Present");
    });
});

describe("sortExperience", () => {
    it("puts current roles first, then the most recent", () => {
        const sorted = sortExperience([role("2022-05", "2022-08", "old"), role("2025-01", "", "now"), role("2024-05", "2024-08", "recent")]);
        expect(sorted.map((entry) => entry.role)).toEqual(["now", "recent", "old"]);
    });
});

describe("pageContentSchema", () => {
    const valid = {
        about: "Hi",
        projects: [{ title: "Webring", url: "https://uoftwebring.com", description: "" }],
        experience: [role("2024-09", "")],
        links: [{ label: "LinkedIn", url: "https://linkedin.com/in/x" }],
        accent: "line-2",
    };

    it("accepts a full page", () => {
        expect(pageContentSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects unsafe or malformed links", () => {
        for (const url of ["javascript:alert(1)", "ftp://x.com", "https://localhost", "not a url"]) {
            expect(pageContentSchema.safeParse({ ...valid, links: [{ label: "x", url }] }).success, url).toBe(false);
        }
    });

    it("rejects an end month before the start, and unknown accents", () => {
        expect(pageContentSchema.safeParse({ ...valid, experience: [role("2024-09", "2024-01")] }).success).toBe(false);
        expect(pageContentSchema.safeParse({ ...valid, accent: "neon" }).success).toBe(false);
    });

    it("treats a whitespace-only project link as no link", () => {
        const parsed = pageContentSchema.safeParse({
            ...valid,
            projects: [{ title: "Webring", url: "   ", description: "" }],
        });
        expect(parsed.success && parsed.data.projects[0].url).toBe("");
    });

    it("caps list sizes like the database does", () => {
        const many = Array.from({ length: 7 }, () => valid.projects[0]);
        expect(pageContentSchema.safeParse({ ...valid, projects: many }).success).toBe(false);
    });
});
