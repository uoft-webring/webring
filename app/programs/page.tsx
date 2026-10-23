import type { Metadata } from "next";
import { TopicIndex } from "@/components/topics/TopicIndex";
import { getViewerProfile } from "@/lib/auth";
import { getPublicProfiles } from "@/lib/profiles/queries";
import { collectTopics } from "@/lib/profiles/topics";

const description = "UofT Webring members by program of study.";

// Search snippet: says who and what in words people search for. The page keeps its shorter intro
const metaDescription =
    "Personal websites of University of Toronto students, grouped by program: Computer Science, Engineering, Mathematics and more.";

export const metadata: Metadata = {
    title: "Programs",
    description: metaDescription,
    alternates: { canonical: "/programs" },
    openGraph: { title: "Programs - UofT Webring", description: metaDescription, url: "/programs" },
};

export default async function ProgramsIndexPage() {
    const [{ data: profiles, error }, viewer] = await Promise.all([getPublicProfiles(), getViewerProfile()]);
    if (error !== null) throw new Error(error);

    return (
        <TopicIndex
            kind="programs"
            topics={collectTopics(profiles, "programs")}
            heading="Programs"
            description={description}
            viewer={viewer}
        />
    );
}
