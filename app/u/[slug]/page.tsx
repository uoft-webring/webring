"use server";
import { getUserProfile } from "@/app/actions"; // ensure this is a server-side util (not a 'use server' action)
import Navbar from "@/components/Navbar"; // can be a Client Component
import ProfileCard from "@/components/ProfileCard";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * This page is experimental
 */

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const { data } = await getUserProfile(slug);
    if (!data) return { title: "User not found" };

    const pageUrl = `https://uoftwebring.com/u/${slug}`;

    return {
        title: `${data.name} - UofT Webring`,
        description: data.tagline || undefined,
        openGraph: {
            title: data.name,
            description: data.tagline || undefined,
            images: data.image_key ? [data.image_key] : undefined,
            url: pageUrl,
        },
        twitter: {
            title: data.name,
            description: data.tagline || undefined,
            images: data.image_key ? [data.image_key] : undefined,
            card: "summary_large_image",
        },
        robots: { index: true, follow: true },
        alternates: { canonical: pageUrl },
    };
}

export default async function User({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const { data, error } = await getUserProfile(slug);
    if (error || !data) notFound();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        dateModified: new Date().toISOString(),
        mainEntity: {
            "@type": "Person",
            name: data.name,
            identifier: data.ring_id,
            ...(data.tagline && { description: data.tagline }),
            ...(data.image_key && { image: data.image_key }),
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
            />
            <Navbar />
            <div className="flex flex-col md:flex-row max-w-[70rem] mx-auto w-full flex-1 place-items-start">
                <div className="max-w-[70rem] mx-auto w-full px-6 mt-12 sm:mt-6">
                    <ProfileCard user={data} />
                </div>
            </div>
        </div>
    );
}
