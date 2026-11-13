export type RingStatus = "disconnected" | "pending" | "connected";

/** Profile fields safe to show anyone. Never add email here. */
export type PublicProfile = {
    ringId: number;
    slug: string;
    name: string;
    tagline: string;
    domain: string;
    githubUsername: string;
    imageKey: string;
    isVerified: boolean;
    ringStatus: RingStatus;
    tags: string[];
    graduationYear: number | null;
    program: string | null;
    /** Looking for co-op / internship roles. */
    openToWork: boolean;
    /** Down on the last ring checks (see ringMembers). Undefined when the read didn't include ring health. */
    siteDown?: boolean;
};

/** The signed-in member's own profile. */
export type OwnProfile = PublicProfile & {
    id: string;
    email: string;
};
