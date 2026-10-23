import type { MetadataRoute } from "next";
import { getPublicProfiles } from "@/lib/profiles/queries";
import { collectTopics, topicPath, type TopicKind } from "@/lib/profiles/topics";
import { profileUrl, SITE_ORIGIN } from "@/lib/site";

// No lastModified: we don't track edits, and a lastmod that's always "now" teaches Google to ignore it.
// Hourly, so new members show up without a deploy. A failed read (e.g. CI builds have no DB)
// falls back to the static pages and heals on the next revalidation
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { data: profiles } = await getPublicProfiles();
    const topicRoutes = (kind: TopicKind) =>
        collectTopics(profiles ?? [], kind).map((topic) => ({
            url: `${SITE_ORIGIN}${topicPath(kind, topic.name)}`,
            changeFrequency: "weekly" as const,
            priority: 0.5,
        }));

    return [
        { url: `${SITE_ORIGIN}/`, changeFrequency: "daily", priority: 1 },
        { url: `${SITE_ORIGIN}/manifesto`, changeFrequency: "monthly", priority: 0.8 },
        { url: `${SITE_ORIGIN}/directory`, changeFrequency: "daily", priority: 0.9 },
        { url: `${SITE_ORIGIN}/plain`, changeFrequency: "daily", priority: 0.7 },
        { url: `${SITE_ORIGIN}/tags`, changeFrequency: "weekly", priority: 0.6 },
        { url: `${SITE_ORIGIN}/programs`, changeFrequency: "weekly", priority: 0.6 },
        ...topicRoutes("tags"),
        ...topicRoutes("programs"),
        ...(profiles ?? [])
            .filter((profile) => profile.slug)
            .map((profile) => ({
                url: profileUrl(profile.slug),
                changeFrequency: "weekly" as const,
                priority: 0.6,
            })),
    ];
}
