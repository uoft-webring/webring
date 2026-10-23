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
