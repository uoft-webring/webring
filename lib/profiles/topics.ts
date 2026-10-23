import type { PublicProfile } from "./types";

export type TopicKind = "tags" | "programs";

export type Topic = { slug: string; name: string; members: PublicProfile[] };

/** URL slug for a tag or program: "C++" -> "c-plus-plus", "Computer Science: AI" -> "computer-science-ai". */
export function topicSlug(name: string): string {
    return name
        .toLowerCase()
        .replaceAll("+", " plus ")
        .replaceAll("#", " sharp ")
        .replaceAll("&", " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function topicPath(kind: TopicKind, name: string): string {
    return `/${kind}/${topicSlug(name)}`;
}

function namesFor(profile: PublicProfile, kind: TopicKind): string[] {
    return kind === "tags" ? profile.tags : profile.program ? [profile.program] : [];
}

/** Every tag or program in use, with its members, most popular first. */
export function collectTopics(profiles: PublicProfile[], kind: TopicKind): Topic[] {
    const topics = new Map<string, Topic>();
    for (const profile of profiles) {
        for (const name of namesFor(profile, kind)) {
            const slug = topicSlug(name);
            if (!slug) continue;
            const topic = topics.get(slug) ?? { slug, name, members: [] };
            topic.members.push(profile);
            topics.set(slug, topic);
        }
    }
    return [...topics.values()].sort((a, b) => b.members.length - a.members.length || a.name.localeCompare(b.name));
}
