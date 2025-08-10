import type { MetadataRoute } from "next";
import { getAllUserProfiles } from "./actions";

const ORIGIN = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://uoftwebring.com").origin;

type PublicProfile = { slug: string };

async function getPublicUserSlugs(): Promise<PublicProfile[]> {
    const res = await getAllUserProfiles();
    const rows: any[] = res?.data ?? [];

    // subdomain is unique - just need to filter out any user's without it and format the slug
    return rows
        .filter((u) => u?.subdomain)
        .map((u) => {
            const slug = String(u.subdomain).trim().toLowerCase();
            return { slug };
        });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const users = await getPublicUserSlugs();
    const now = new Date();

    const staticRoutes = [
        {
            url: `${ORIGIN}/`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${ORIGIN}/manifesto`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${ORIGIN}/directory`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
        },
    ] satisfies MetadataRoute.Sitemap;

    const userRoutes = users.map(({ slug }) => ({
        url: `${ORIGIN}/u/${encodeURIComponent(slug)}`,
        lastModified: now, // no nulls
        changeFrequency: "weekly",
        priority: 0.6,
    })) satisfies MetadataRoute.Sitemap;

    return [...staticRoutes, ...userRoutes] satisfies MetadataRoute.Sitemap;
}
