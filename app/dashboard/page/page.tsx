import type { Metadata } from "next";
import { PageEditor } from "@/components/page-editor/PageEditor";
import { requireOwnProfile } from "@/lib/auth";
import { getOwnPageContent } from "@/lib/profiles/page";

export const metadata: Metadata = { title: "Customize your page", robots: { index: false } };

export default async function CustomizePage() {
    const profile = await requireOwnProfile();
    const content = await getOwnPageContent(profile.id);
    // A failed read must not hand the editor an empty page that autosave would then write back
    if (!content) throw new Error("Could not load your page content.");
    return <PageEditor initialContent={content} slug={profile.slug} />;
}
