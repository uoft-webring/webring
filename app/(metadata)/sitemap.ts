/*  We should make dynamic routes */
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://uoftwebring.com",
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
    ];
}
