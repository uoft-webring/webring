import { describe, it, expect } from "vitest";
import { parseEmail, parseName, parseDomain, User, SafeUser } from "@/utils/zod";

describe("parseEmail", () => {
    it("accepts valid utoronto.ca emails", () => {
        const result = parseEmail("student@utoronto.ca");
        expect(result.success).toBe(true);
        if (result.success) expect(result.data).toBe("student@utoronto.ca");
    });

    it("accepts mail.utoronto.ca subdomains", () => {
        const result = parseEmail("student@mail.utoronto.ca");
        expect(result.success).toBe(true);
    });

    it("lowercases email addresses", () => {
        const result = parseEmail("Student@UTORONTO.CA");
        expect(result.success).toBe(true);
        if (result.success) expect(result.data).toBe("student@utoronto.ca");
    });

    it("rejects non-utoronto emails", () => {
        const result = parseEmail("user@gmail.com");
        expect(result.success).toBe(false);
    });

    it("rejects empty strings", () => {
        const result = parseEmail("");
        expect(result.success).toBe(false);
    });

    it("rejects non-string inputs", () => {
        const result = parseEmail(123);
        expect(result.success).toBe(false);
    });

    it("rejects strings without @ symbol", () => {
        const result = parseEmail("notanemail");
        expect(result.success).toBe(false);
    });
});

describe("parseName", () => {
    it("accepts non-empty names", () => {
        const result = parseName("John Doe");
        expect(result.success).toBe(true);
    });

    it("rejects empty strings", () => {
        const result = parseName("");
        expect(result.success).toBe(false);
    });

    it("rejects non-string inputs", () => {
        const result = parseName(null);
        expect(result.success).toBe(false);
    });
});

describe("parseDomain", () => {
    it("accepts valid domains", () => {
        const result = parseDomain("example.com");
        expect(result.success).toBe(true);
    });

    it("rejects subdomains (regex only matches single-level domains)", () => {
        const result = parseDomain("blog.example.com");
        expect(result.success).toBe(false);
    });

    it("accepts short single-dot domains matching the regex", () => {
        const result = parseDomain("localhost.co");
        expect(result.success).toBe(true);
    });

    it("rejects empty strings", () => {
        const result = parseDomain("");
        expect(result.success).toBe(false);
    });

    it("rejects single character domains", () => {
        const result = parseDomain("a.c");
        expect(result.success).toBe(false);
    });
});

describe("User schema", () => {
    const validUser = {
        email: "student@utoronto.ca",
        ring_id: 1,
        id: "abc-123",
        name: "Jane Doe",
        tagline: "Hello world",
        domain: "https://janedoe.com",
        image_key: "avatar_123.avif",
        is_verified: false,
        validated_user_component: "",
        github_url: "https://github.com/janedoe",
        tags: ["TypeScript", "React"],
        graduation_year: 2026,
        program: "Computer Science",
        slug: "jane-doe",
    };

    it("accepts a fully valid user", () => {
        const result = User.safeParse(validUser);
        expect(result.success).toBe(true);
    });

    it("allows nullable fields to be null", () => {
        const result = User.safeParse({
            ...validUser,
            tagline: null,
            github_url: null,
            tags: null,
            graduation_year: null,
            program: null,
        });
        expect(result.success).toBe(true);
    });

    it("rejects non-utoronto emails", () => {
        const result = User.safeParse({ ...validUser, email: "user@gmail.com" });
        expect(result.success).toBe(false);
    });

    it("rejects negative ring_id", () => {
        const result = User.safeParse({ ...validUser, ring_id: -1 });
        expect(result.success).toBe(false);
    });

    it("rejects taglines over 255 characters", () => {
        const result = User.safeParse({ ...validUser, tagline: "a".repeat(256) });
        expect(result.success).toBe(false);
    });

    it("rejects invalid domain URLs", () => {
        const result = User.safeParse({ ...validUser, domain: "not-a-url" });
        expect(result.success).toBe(false);
    });

    it("rejects non-avif image keys", () => {
        const result = User.safeParse({ ...validUser, image_key: "photo.png" });
        expect(result.success).toBe(false);
    });

    it("allows empty string image keys", () => {
        const result = User.safeParse({ ...validUser, image_key: "" });
        expect(result.success).toBe(true);
    });

    it("rejects more than 3 tags", () => {
        const result = User.safeParse({ ...validUser, tags: ["a", "b", "c", "d"] });
        expect(result.success).toBe(false);
    });

    it("rejects graduation years before 1900", () => {
        const result = User.safeParse({ ...validUser, graduation_year: 1800 });
        expect(result.success).toBe(false);
    });

    it("rejects slugs with uppercase letters", () => {
        const result = User.safeParse({ ...validUser, slug: "Jane-Doe" });
        expect(result.success).toBe(false);
    });

    it("rejects slugs starting with a hyphen", () => {
        const result = User.safeParse({ ...validUser, slug: "-jane" });
        expect(result.success).toBe(false);
    });

    it("rejects slugs ending with a hyphen", () => {
        const result = User.safeParse({ ...validUser, slug: "jane-" });
        expect(result.success).toBe(false);
    });

    it("rejects slugs shorter than 2 characters", () => {
        const result = User.safeParse({ ...validUser, slug: "j" });
        expect(result.success).toBe(false);
    });

    it("rejects slugs longer than 30 characters", () => {
        const result = User.safeParse({ ...validUser, slug: "a".repeat(31) });
        expect(result.success).toBe(false);
    });
});

describe("SafeUser schema", () => {
    it("omits email and id fields", () => {
        const result = SafeUser.safeParse({
            ring_id: 1,
            name: "Jane Doe",
            tagline: null,
            domain: "https://janedoe.com",
            image_key: "",
            is_verified: false,
            validated_user_component: "",
            github_url: null,
            tags: null,
            graduation_year: 2026,
            program: "Computer Science",
            slug: "jane-doe",
        });
        expect(result.success).toBe(true);
    });
});
