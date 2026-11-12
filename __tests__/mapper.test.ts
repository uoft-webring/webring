import { describe, expect, it } from "vitest";
import { toProfileInput, toPublicProfile, type PublicProfileRow } from "@/lib/profiles/mapper";

const row: PublicProfileRow = {
    ring_id: 3,
    slug: null,
    name: null,
    tagline: null,
    domain: null,
    github_url: "Badbird5907 ",
    image_key: null,
    is_verified: null,
    validated_user_component: null,
    tags: null,
    graduation_year: null,
    program: null,
    open_to_work: null,
};

describe("toPublicProfile", () => {
    it("marks a site down only after two down checks, and up when health wasn't read", () => {
        expect(toPublicProfile({ ...row, ring_link_state: { consecutive_down: 2 } }).siteDown).toBe(true);
        expect(toPublicProfile({ ...row, ring_link_state: { consecutive_down: 1 } }).siteDown).toBe(false);
        expect(toPublicProfile({ ...row, ring_link_state: null }).siteDown).toBe(false);
        expect(toPublicProfile(row).siteDown).toBe(false);
    });

    it("normalises nullable columns so components never null-check", () => {
        expect(toPublicProfile(row)).toEqual({
            ringId: 3,
            slug: "",
            name: "",
            tagline: "",
            domain: "",
            githubUsername: "Badbird5907",
            imageKey: "",
            isVerified: false,
            ringStatus: "disconnected",
            tags: [],
            graduationYear: null,
            program: null,
            openToWork: false,
            siteDown: false,
        });
    });

    it("never exposes email", () => {
        expect(Object.keys(toPublicProfile({ ...row, email: "x@mail.utoronto.ca" } as PublicProfileRow))).not.toContain(
            "email"
        );
    });

    it("round-trips to editable input", () => {
        const input = toProfileInput(toPublicProfile({ ...row, slug: "jane", name: "Jane" }));
        expect(input).toMatchObject({ slug: "jane", name: "Jane", tags: [], githubUsername: "Badbird5907" });
    });
});
