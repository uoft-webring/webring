import type { Metadata } from "next";
import { TopicIndex } from "@/components/topics/TopicIndex";
import { getViewerProfile } from "@/lib/auth";
import { getPublicProfiles } from "@/lib/profiles/queries";
import { collectTopics } from "@/lib/profiles/topics";

const description = "What UofT Webring members build with and care about.";

export const metadata: Metadata = {
    title: "Tags",
    description,
    alternates: { canonical: "/tags" },
    openGraph: { title: "Tags - UofT Webring", description, url: "/tags" },
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
