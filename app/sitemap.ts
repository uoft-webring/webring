import type { MetadataRoute } from "next";
import { getPublicProfiles } from "@/lib/profiles/queries";
import { profileUrl, SITE_ORIGIN } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { data: profiles } = await getPublicProfiles();
    const now = new Date();

    return [
        { url: `${SITE_ORIGIN}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
        { url: `${SITE_ORIGIN}/manifesto`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
        { url: `${SITE_ORIGIN}/directory`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
        ...(profiles ?? [])
            .filter((profile) => profile.slug)
            .map((profile) => ({
                url: profileUrl(profile.slug),
                lastModified: now,
                changeFrequency: "weekly" as const,
                priority: 0.6,
            })),
    ];
}
