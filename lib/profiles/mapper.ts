import type { OwnProfile, PublicProfile, RingStatus } from "./types";
import type { ProfileInput } from "@/lib/validation";

/** Columns that may be read for public pages. `email` is deliberately absent. */
export const PUBLIC_PROFILE_COLUMNS =
    "ring_id, slug, name, tagline, domain, github_url, image_key, is_verified, validated_user_component, tags, graduation_year, program, open_to_work";

export const OWN_PROFILE_COLUMNS = `id, email, ${PUBLIC_PROFILE_COLUMNS}`;

export type PublicProfileRow = {
    ring_id: number;
    slug: string | null;
    name: string | null;
    tagline: string | null;
    domain: string | null;
    github_url: string | null;
    image_key: string | null;
    is_verified: boolean | null;
    validated_user_component: RingStatus | null;
    tags: string[] | null;
    graduation_year: number | null;
    program: string | null;
    open_to_work: boolean | null;
};

export type OwnProfileRow = PublicProfileRow & { id: string; email: string | null };

// Columns are nullable in the DB; normalise once here so components never null-check.
export function toPublicProfile(row: PublicProfileRow): PublicProfile {
    return {
        ringId: row.ring_id,
        slug: row.slug ?? "",
        name: row.name ?? "",
        tagline: row.tagline ?? "",
        domain: row.domain ?? "",
        githubUsername: (row.github_url ?? "").trim(),
        imageKey: row.image_key ?? "",
        isVerified: row.is_verified ?? false,
        ringStatus: row.validated_user_component ?? "disconnected",
        tags: row.tags ?? [],
        graduationYear: row.graduation_year,
        program: row.program,
        openToWork: row.open_to_work ?? false,
    };
}

export function toOwnProfile(row: OwnProfileRow): OwnProfile {
    return { ...toPublicProfile(row), id: row.id, email: row.email ?? "" };
}

export function toProfileInput(profile: PublicProfile): ProfileInput {
    return {
        name: profile.name,
        domain: profile.domain,
        tagline: profile.tagline,
        githubUsername: profile.githubUsername,
        imageKey: profile.imageKey,
        tags: profile.tags,
        graduationYear: profile.graduationYear,
        program: profile.program,
        slug: profile.slug,
        openToWork: profile.openToWork,
    };
}

/** Editable columns only; matches the column grants on public.profile. */
export function toProfileUpdate(input: ProfileInput) {
    return {
        name: input.name,
        domain: input.domain,
        tagline: input.tagline,
        github_url: input.githubUsername,
        image_key: input.imageKey,
        tags: input.tags,
        graduation_year: input.graduationYear,
        program: input.program,
        slug: input.slug,
        open_to_work: input.openToWork,
    };
}
