import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { SkillTag } from "@/components/SkillTag";
import type { OwnProfile } from "@/lib/profiles/types";
import { topicPath, type Topic, type TopicKind } from "@/lib/profiles/topics";

/** Every tag or program in use, linking to its members. */
export function TopicIndex({
    kind,
    topics,
    heading,
    description,
    viewer,
}: {
    kind: TopicKind;
    topics: Topic[];
    heading: string;
    description: string;
    viewer: OwnProfile | null;
}): React.JSX.Element {
    return (
        <div className="bg-background flex min-h-screen flex-col">
            <Navbar user={viewer} />
            <main className="container mx-auto max-w-[75rem] px-4 py-6">
                <h1 className="mb-2">{heading}</h1>
                <p className="mb-8">{description}</p>
                {topics.length === 0 && <p className="text-muted-foreground">No members yet.</p>}
                <ul className="flex flex-wrap gap-3">
                    {topics.map((topic) => (
                        <li key={topic.slug}>
                            <Link href={topicPath(kind, topic.name)} className="flex items-center gap-2 hover:opacity-80">
                                {kind === "tags" ? (
                                    <SkillTag tagName={topic.name} />
                                ) : (
                                    <span className="bg-card rounded-full border px-3 py-1 font-semibold">{topic.name}</span>
                                )}
                                <span className="text-muted-foreground text-sm tabular-nums">{topic.members.length}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );
}
