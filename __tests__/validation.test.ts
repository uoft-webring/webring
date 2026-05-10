import { describe, expect, it } from "vitest";
import { programs } from "@/lib/data/programs";
import { emailSchema, nameSchema, otpSchema, profileInputSchema, type ProfileInput } from "@/lib/validation";

describe("emailSchema", () => {
    it.each(["student@mail.utoronto.ca", "grad@alum.utoronto.ca", "grad@alumni.utoronto.ca", "staff@utoronto.ca"])(
        "accepts %s",
        (email) => expect(emailSchema.safeParse(email).success).toBe(true)
    );

    it("trims and lowercases", () => {
        expect(emailSchema.parse("  Student@MAIL.UTORONTO.CA ")).toBe("student@mail.utoronto.ca");
    });

    it.each([
        "user@gmail.com",
        // Look-alike domains the old endsWith("utoronto.ca") check let through
        "x@evilutoronto.ca",
        "x@notutoronto.ca",
        "x@utoronto.ca.evil.com",
        "x@cs.utoronto.ca",
        "",
        "notanemail",
    ])("rejects %s", (email) => expect(emailSchema.safeParse(email).success).toBe(false));

    it("rejects non-strings", () => {
        expect(emailSchema.safeParse(123).success).toBe(false);
        expect(emailSchema.safeParse(undefined).success).toBe(false);
    });
});

describe("nameSchema", () => {
    it("accepts and trims names", () => expect(nameSchema.parse("  Jane Doe ")).toBe("Jane Doe"));
    it("rejects blank names", () => expect(nameSchema.safeParse("   ").success).toBe(false));
    it("rejects overly long names", () => expect(nameSchema.safeParse("a".repeat(81)).success).toBe(false));
});

describe("otpSchema", () => {
    it("accepts 6 digits", () => expect(otpSchema.safeParse("012345").success).toBe(true));
    it.each(["12345", "1234567", "12a456", ""])("rejects %s", (code) =>
        expect(otpSchema.safeParse(code).success).toBe(false)
    );
});

const valid: ProfileInput = {
    name: "Jane Doe",
    domain: "https://jane.dev",
    tagline: "Hello",
    githubUsername: "jane-doe",
    imageKey: "",
    tags: ["React"],
    graduationYear: 2027,
    program: "Computer Science",
    slug: "jane-doe",
};

function parse(patch: Partial<ProfileInput>) {
    return profileInputSchema.safeParse({ ...valid, ...patch });
}

describe("profileInputSchema", () => {
    it("accepts a complete profile", () => expect(parse({}).success).toBe(true));

    it("allows an empty domain so new members can save other fields first", () => {
        expect(parse({ domain: "" }).success).toBe(true);
    });

    it.each([
        "javascript:alert(1)",
        "ftp://jane.dev",
        "https://https",
        "jane.dev",
        "data:text/html,hi",
        // The DB constraint is case-sensitive and forbids whitespace
        "HTTPS://jane.dev",
        "https://jane.dev/a b",
    ])(
        "rejects domain %s",
        (domain) => expect(parse({ domain }).success).toBe(false)
    );

    it("accepts the UUID slug every new account starts with", () => {
        expect(parse({ slug: "0b9c6f5e-3a8d-4c1e-9f2b-7d6a5e4c3b2a" }).success).toBe(true);
    });

    it.each(["J", "Jane", "jane--doe", "-jane", "jane-", "jane_doe", "a".repeat(41)])("rejects slug %s", (slug) =>
        expect(parse({ slug }).success).toBe(false)
    );

    it("caps tags at 3", () => expect(parse({ tags: ["a", "b", "c", "d"] }).success).toBe(false));
    it("caps the bio at 255 characters", () => expect(parse({ tagline: "x".repeat(256) }).success).toBe(false));

    it.each(["-bad", "bad-", "a".repeat(40), "has space"])("rejects GitHub username %s", (githubUsername) =>
        expect(parse({ githubUsername }).success).toBe(false)
    );

    it("only accepts .avif image keys", () => {
        expect(parse({ imageKey: "abc_123.avif" }).success).toBe(true);
        expect(parse({ imageKey: "../other/key.avif" }).success).toBe(false);
        expect(parse({ imageKey: "abc.png" }).success).toBe(false);
    });

    it("bounds the graduation year", () => {
        expect(parse({ graduationYear: null }).success).toBe(true);
        expect(parse({ graduationYear: 1899 }).success).toBe(false);
        expect(parse({ graduationYear: 2222 }).success).toBe(false);
        expect(parse({ graduationYear: 2026.5 }).success).toBe(false);
    });

    it("accepts every program in the picker", () => {
        const rejected = programs.filter(({ value }) => !parse({ program: value }).success).map(({ value }) => value);
        expect(rejected).toEqual([]);
    });

    it("rejects programs with unexpected characters", () => {
        expect(parse({ program: "<script>" }).success).toBe(false);
    });
});
