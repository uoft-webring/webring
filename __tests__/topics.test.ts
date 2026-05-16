import { describe, expect, it } from "vitest";
import { collectTopics, topicSlug } from "@/lib/profiles/topics";
import type { PublicProfile } from "@/lib/profiles/types";

describe("topicSlug", () => {
    it.each([
        ["C++", "c-plus-plus"],
        ["C#", "c-sharp"],
        ["C", "c"],
        ["Next.js", "next-js"],
        ["MITRE ATT&CK", "mitre-att-and-ck"],
        ["Computer Science: Software Engineering", "computer-science-software-engineering"],
    ])("%s -> %s", (name, slug) => expect(topicSlug(name)).toBe(slug));

    it("keeps C, C++ and C# apart", () => {
        expect(new Set(["C", "C++", "C#"].map(topicSlug)).size).toBe(3);
    });
});

describe("collectTopics", () => {
    const profile = (ringId: number, tags: string[], program: string | null) =>
        ({ ringId, tags, program }) as unknown as PublicProfile;

    it("groups members and sorts by popularity", () => {
        const topics = collectTopics([profile(1, ["React", "Go"], null), profile(2, ["React"], null)], "tags");
        expect(topics.map((topic) => [topic.name, topic.members.length])).toEqual([
            ["React", 2],
            ["Go", 1],
        ]);
    });

    it("uses programs when asked", () => {
        expect(collectTopics([profile(1, [], "Computer Science"), profile(2, [], null)], "programs")).toHaveLength(1);
    });
});
