import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopicMembers } from "@/components/topics/TopicMembers";
import { getViewerProfile } from "@/lib/auth";
import { getPublicProfiles } from "@/lib/profiles/queries";
import { collectTopics, topicPath, type Topic } from "@/lib/profiles/topics";

async function findTopic(slug: string): Promise<Topic | null> {
    const { data: profiles, error } = await getPublicProfiles();
    if (error !== null) throw new Error(error);
    // Slugs are lowercase; accept /tags/JavaScript-style links too
    const wanted = slug.toLowerCase();
    return collectTopics(profiles, "tags").find((topic) => topic.slug === wanted) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/tags/[tag]">): Promise<Metadata> {
    const topic = await findTopic((await params).tag);
    // Otherwise it inherits the root layout's canonical "/"
    if (!topic) return { title: "Not found", robots: { index: false }, alternates: { canonical: null } };

    const title = `UofT students into ${topic.name}`;
    const description = `${topic.members.length} UofT Webring ${topic.members.length === 1 ? "member" : "members"}: ${topic.members
        .slice(0, 5)
        .map((member) => member.name)
        .join(", ")}${topic.members.length > 5 ? " and more" : ""}.`;
    return {
        title,
        description,
        alternates: { canonical: topicPath("tags", topic.name) },
        openGraph: { title: `${title} - UofT Webring`, description, url: topicPath("tags", topic.name) },
    };
}

export default async function TagPage({ params }: PageProps<"/tags/[tag]">) {
    const [topic, viewer] = await Promise.all([findTopic((await params).tag), getViewerProfile()]);
    if (!topic) notFound();

    return <TopicMembers kind="tags" topic={topic} heading={`Members into ${topic.name}`} viewer={viewer} />;
}
