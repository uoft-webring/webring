import { DirectoryBrowser, type DirectoryFilters } from "@/components/directory/DirectoryBrowser";
import type { PublicProfile } from "@/lib/profiles/types";
import { getPublicProfiles } from "@/lib/profiles/queries";
import { profileUrl } from "@/lib/site";

function uniqueSorted(values: (string | number | null)[]): string[] {
    const set = new Set(values.filter((value) => value !== null).map((value) => String(value).trim()));
    set.delete("");
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function filterOptions(profiles: PublicProfile[]): DirectoryFilters {
    return {
        tags: uniqueSorted(profiles.flatMap((profile) => profile.tags)),
        programs: uniqueSorted(profiles.map((profile) => profile.program)),
        graduationYears: uniqueSorted(profiles.map((profile) => profile.graduationYear)),
    };
}

export default async function DirectoryPage() {
    const { data: profiles, error } = await getPublicProfiles();

    if (error !== null) {
        return (
            <p className="text-muted-foreground px-6 py-24 text-center">
                We couldn&apos;t load the directory right now. Please refresh in a moment.
            </p>
        );
    }

    const listed = profiles.filter((profile) => profile.slug && profile.name);
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "UofT Webring Directory",
        description: "A directory of University of Toronto students and their personal websites.",
        numberOfItems: listed.length,
        itemListElement: listed.slice(0, 50).map((profile, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
                "@type": "Person",
                name: profile.name,
                url: profileUrl(profile.slug),
                ...(profile.domain && { sameAs: profile.domain }),
            },
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
            />
            <DirectoryBrowser profiles={listed} filters={filterOptions(listed)} />
        </>
    );
}
