import type { Metadata } from "next";
import { TopicIndex } from "@/components/topics/TopicIndex";
import { getViewerProfile } from "@/lib/auth";
import { getPublicProfiles } from "@/lib/profiles/queries";
import { collectTopics } from "@/lib/profiles/topics";

const description = "What UofT Webring members build with and care about.";

// Search snippet: says who and what in words people search for. The page keeps its shorter intro
const metaDescription =
    "University of Toronto students grouped by what they build with and care about, from React and Python to machine learning and design.";

export const metadata: Metadata = {
    title: "Tags",
    description: metaDescription,
    alternates: { canonical: "/tags" },
    openGraph: { title: "Tags - UofT Webring", description: metaDescription, url: "/tags" },
};

export default async function TagsIndexPage() {
    const [{ data: profiles, error }, viewer] = await Promise.all([getPublicProfiles(), getViewerProfile()]);
    if (error !== null) throw new Error(error);

    return (
        <TopicIndex
            kind="tags"
            topics={collectTopics(profiles, "tags")}
            heading="Tags"
            description={description}
            viewer={viewer}
        />
    );
}
