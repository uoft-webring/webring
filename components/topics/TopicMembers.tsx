import Link from "next/link";
import { HorizontalProfileCard } from "@/components/HorizontalProfileCard";
import { Navbar } from "@/components/Navbar";
import type { OwnProfile } from "@/lib/profiles/types";
import type { Topic, TopicKind } from "@/lib/profiles/topics";

const INDEX_LABEL: Record<TopicKind, string> = { tags: "All tags", programs: "All programs" };

/** Members sharing one tag or program. */
export function TopicMembers({
    kind,
    topic,
    heading,
    viewer,
}: {
    kind: TopicKind;
    topic: Topic;
    heading: string;
    viewer: OwnProfile | null;
}): React.JSX.Element {
    return (
        <div className="bg-background flex min-h-screen flex-col">
            <Navbar user={viewer} />
            <main className="container mx-auto max-w-[75rem] px-4 py-6">
                <nav aria-label="Breadcrumb" className="text-muted-foreground mb-4 text-sm">
                    <Link href="/directory" className="hover:underline">
                        Directory
                    </Link>
                    {" / "}
                    <Link href={`/${kind}`} className="hover:underline">
                        {INDEX_LABEL[kind]}
                    </Link>
                </nav>
                <h1 className="mb-2">{heading}</h1>
                <p className="mb-6">
                    {topic.members.length} {topic.members.length === 1 ? "member" : "members"} of the UofT Webring
                </p>
                <div className="grid grid-cols-1 gap-4">
                    {topic.members.map((profile) => (
                        <HorizontalProfileCard key={profile.ringId} profile={profile} />
                    ))}
                </div>
            </main>
        </div>
    );
}
