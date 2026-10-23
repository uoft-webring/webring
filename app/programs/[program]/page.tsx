import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopicMembers } from "@/components/topics/TopicMembers";
import { getViewerProfile } from "@/lib/auth";
import { getPublicProfiles } from "@/lib/profiles/queries";
import { collectTopics, topicPath, type Topic } from "@/lib/profiles/topics";

async function findTopic(slug: string): Promise<Topic | null> {
    const { data: profiles, error } = await getPublicProfiles();
    if (error !== null) throw new Error(error);
    // Slugs are lowercase; accept /programs/JavaScript-style links too
    const wanted = slug.toLowerCase();
    return collectTopics(profiles, "programs").find((topic) => topic.slug === wanted) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/programs/[program]">): Promise<Metadata> {
    const topic = await findTopic((await params).program);
    // Otherwise it inherits the root layout's canonical "/"
    if (!topic) return { title: "Not found", robots: { index: false }, alternates: { canonical: null } };

    const title = `UofT ${topic.name} students`;
    const description = `${topic.members.length} UofT Webring ${topic.members.length === 1 ? "member" : "members"}: ${topic.members
        .slice(0, 5)
        .map((member) => member.name)
        .join(", ")}${topic.members.length > 5 ? " and more" : ""}.`;
    return {
        title,
        description,
        alternates: { canonical: topicPath("programs", topic.name) },
        openGraph: { title: `${title} - UofT Webring`, description, url: topicPath("programs", topic.name) },
    };
}

export default async function ProgramPage({ params }: PageProps<"/programs/[program]">) {
    const [topic, viewer] = await Promise.all([findTopic((await params).program), getViewerProfile()]);
    if (!topic) notFound();

    return <TopicMembers kind="programs" topic={topic} heading={`Members studying ${topic.name}`} viewer={viewer} />;
}
