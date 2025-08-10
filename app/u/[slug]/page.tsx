"use server";
import { getUserProfile } from "@/app/actions";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import { notFound } from "next/navigation";

/**
 * This page is experimental
 *
 */
export default async function User({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // We get the user profile from the database with the particular slug as their subdomain
    const { data, error } = await getUserProfile(slug);

    if (error || !data) {
        notFound();
    }
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        dateModified: new Date().toISOString(),
        mainEntity: {
            "@type": "Person",
            name: data.name,
            identifier: data.ring_id,
            ...(data.tagline && { description: data.tagline }),
            ...(data.image_url && { image: data.image_url }),
            sameAs: [
                ...(data.github_url ? [`https://github.com/${data.github_url}`] : []),
                ...(data.domain ? [data.domain] : []),
            ],
        },
        ...(data.domain && { relatedLink: data.domain }),
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
                }}
            />
            <Navbar />
            <div className="flex flex-col md:flex-row max-w-[70rem] mx-auto w-full flex-1  place-items-start">
                <div className="max-w-[70rem] mx-auto w-full px-6 mt-12 sm:mt-6">
                    <ProfileCard user={data} />
                </div>
            </div>
        </div>
    );
}
