// Who an admin email goes to. Pure: the composer shows a live count with the same rules the server
// uses to fix the recipient list. Every filter left empty means "anyone"; filters combine with AND.
// Members who unsubscribed are never included, whatever the audience says.
import { z } from "zod";
import { isLinkableDomain } from "@/lib/profiles/ring";
import type { RingStatus } from "@/lib/profiles/types";

export const RING_STATUSES = ["connected", "pending", "disconnected"] as const satisfies readonly RingStatus[];

export const SITE_FILTERS = {
    any: "Any",
    has_site: "Has a site",
    no_site: "No site yet",
    down: "Site is down",
} as const;

export type SiteFilter = keyof typeof SITE_FILTERS;

export const audienceSchema = z.object({
    ringStatus: z.array(z.enum(RING_STATUSES)).max(RING_STATUSES.length).default([]),
    site: z.enum(Object.keys(SITE_FILTERS) as [SiteFilter, ...SiteFilter[]]).default("any"),
    graduationYears: z.array(z.number().int().min(1900).max(2100)).max(30).default([]),
    openToWork: z.boolean().nullable().default(null),
    // Hand-picked members by ring id, for a note to a few people
    ringIds: z.array(z.number().int().nonnegative()).max(1000).default([]),
});

export type Audience = z.infer<typeof audienceSchema>;

export const EVERYONE: Audience = audienceSchema.parse({});

/** The member facts the audience filters read. */
export type AudienceMember = {
    ringId: number;
    ringStatus: RingStatus;
    domain: string;
    siteDown: boolean;
    graduationYear: number | null;
    openToWork: boolean;
};

export function matchesAudience(member: AudienceMember, audience: Audience): boolean {
    if (audience.ringIds.length > 0 && !audience.ringIds.includes(member.ringId)) return false;
    if (audience.ringStatus.length > 0 && !audience.ringStatus.includes(member.ringStatus)) return false;
    if (audience.graduationYears.length > 0 && (member.graduationYear === null || !audience.graduationYears.includes(member.graduationYear)))
        return false;
    if (audience.openToWork !== null && member.openToWork !== audience.openToWork) return false;
    const hasSite = isLinkableDomain(member.domain);
    if (audience.site === "has_site" && !hasSite) return false;
    if (audience.site === "no_site" && hasSite) return false;
    if (audience.site === "down" && !(hasSite && member.siteDown)) return false;
    return true;
}

/** One line for the campaign list and the send confirmation, e.g. "Connected · class of 2027". */
export function describeAudience(audience: Audience): string {
    const parts: string[] = [];
    if (audience.ringIds.length > 0)
        parts.push(`${audience.ringIds.length} hand-picked member${audience.ringIds.length === 1 ? "" : "s"}`);
    if (audience.ringStatus.length > 0)
        parts.push(audience.ringStatus.map((status) => status[0].toUpperCase() + status.slice(1)).join(" or "));
    if (audience.site !== "any") parts.push(SITE_FILTERS[audience.site]);
    if (audience.graduationYears.length > 0)
        parts.push(`class of ${[...audience.graduationYears].sort((a, b) => a - b).join(", ")}`);
    if (audience.openToWork !== null) parts.push(audience.openToWork ? "Open to work" : "Not open to work");
    return parts.length === 0 ? "Every member" : parts.join(" · ");
}
