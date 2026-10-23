import type { MetadataRoute } from "next";
import { getPublicProfiles } from "@/lib/profiles/queries";
import { collectTopics, topicPath, type TopicKind } from "@/lib/profiles/topics";
import { profileUrl, SITE_ORIGIN } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { data: profiles, error } = await getPublicProfiles();
    // Throwing keeps the last good sitemap instead of caching one without members
    if (error !== null) throw new Error(error);
    const now = new Date();
    const topicRoutes = (kind: TopicKind) =>
        collectTopics(profiles ?? [], kind).map((topic) => ({
            url: `${SITE_ORIGIN}${topicPath(kind, topic.name)}`,
            lastModified: now,
            changeFrequency: "weekly" as const,
            priority: 0.5,
        }));

    return [
        { url: `${SITE_ORIGIN}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
        { url: `${SITE_ORIGIN}/manifesto`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
        { url: `${SITE_ORIGIN}/directory`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
        { url: `${SITE_ORIGIN}/plain`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
        { url: `${SITE_ORIGIN}/tags`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
        { url: `${SITE_ORIGIN}/programs`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
        ...topicRoutes("tags"),
        ...topicRoutes("programs"),
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
