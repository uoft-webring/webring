"use server";
import { getUserProfile } from "@/app/actions";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import { Book, BookOpen, CheckCircle, Clock, Globe, GraduationCap, TagIcon, UserIcon } from "lucide-react";
import SkillTag from "@/components/SkillTag";

import gitHubIcon from "@/icons/gitHub.svg";
import portfolioIcon from "@/icons/portfolio.svg";
import Image from "next/image";
import ShareButton from "@/components/ShareButton";

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
    const domainLabel = data.domain?.replace(/^https?:\/\/(www\.)?/i, "");

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
                }}
            />

            <Navbar user={data} />

            <div className="container max-w-7xl mx-auto flex-1 px-6 py-5">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Profile Sidebar */}
                    <aside className="lg:col-span-1 space-y-8">
                        <div className="p-8 bg-card border border-border shadow-lg rounded-3xl sticky top-8">
                            <div className="flex flex-col items-center text-center">
                                {data.image_key && <Avatar user={data} className="w-32 h-32" />}

                                <h2 className="text-2xl py-2 font-bold capitalize text-center">
                                    {data.name}
                                </h2>

                                {data.is_verified && (
                                    <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-green-500">
                                        <CheckCircle className="w-4 h-4 fill-green-500 stroke-background" />
                                        Verified
                                    </div>
                                )}

                                <div className="w-full my-6 border-t border-border" />

                                <div className="w-full space-y-4 text-muted-foreground">
                                    {data.program && (
                                        <div className="flex gap-5 items-center">
                                            <Book className="w-5 h-5 text-primary shrink-0" />
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    {data.program}
                                                </p>
                                                <p className="text-sm">Program</p>
                                            </div>
                                        </div>
                                    )}
                                    {data.graduation_year && (
                                        <div className="flex gap-5 items-center">
                                            <GraduationCap className="w-5 h-5 text-primary shrink-0" />
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    Class of {data.graduation_year}
                                                </p>
                                                <p className="text-sm">Graduation Year</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full my-6 border-t border-border" />

                                <div className="flex flex-col gap-3 w-full">
                                    {data.domain && (
                                        <a
                                            href={data.domain}
                                            target="_blank"
                                            rel="noopener noreferrer nofollow"
                                            className="flex items-center px-3 py-2.5 rounded-full bg-popover hover:bg-secondary/80 text-sm transition"
                                        >
                                            <Image
                                                src={portfolioIcon}
                                                alt="Website"
                                                width={20}
                                                height={20}
                                                decoding="async"
                                                className="mr-2"
                                            />
                                            {domainLabel && domainLabel.length <= 30
                                                ? domainLabel
                                                : "Portfolio"}
                                        </a>
                                    )}
                                    {data.github_url && (
                                        <a
                                            href={`https://github.com/${data.github_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer nofollow"
                                            className="flex items-center px-3 py-2.5 rounded-full bg-popover hover:bg-secondary/80 text-sm transition"
                                        >
                                            <Image
                                                src={gitHubIcon}
                                                alt="GitHub"
                                                width={20}
                                                height={20}
                                                decoding="async"
                                                className="mr-2"
                                            />
                                            {data.github_url.length <= 30 ? data.github_url : "GitHub"}
                                        </a>
                                    )}
                                    <ShareButton
                                        title={`${data.name}'s UofT Webring Profile`}
                                        url={`${process.env.HOME_DOMAIN}u/${data.slug}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {!!data.tags?.length && (
                            <div className="p-6 bg-card border border-border rounded-2xl shadow">
                                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold border-b border-border pb-2">
                                    <TagIcon className="w-5 h-5 text-primary" />
                                    Interests
                                </h3>

                                <div className="flex flex-row flex-wrap gap-2 justify-center">
                                    {data.tags.map((tagName: string) => (
                                        <SkillTag key={tagName} tagName={tagName} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>

                    <main className="lg:col-span-3 space-y-10">
                        <section className="p-10 bg-card border border-border rounded-3xl shadow-lg">
                            <h2 className="mb-6 flex items-center gap-3 text-3xl font-bold capitalize">
                                <UserIcon className="w-7 h-7 text-primary" />
                                About {data.name}
                            </h2>
                            <div className="prose max-w-none prose-xl prose-a:text-primary prose-strong:text-foreground">
                                {data.tagline ? (
                                    <p className="text-md text-muted-foreground flex-1 px-4 text-pretty normal-case break-all hyphens-auto">
                                        {data.tagline}
                                    </p>
                                ) : (
                                    <p className="italic text-md text-muted-foreground">
                                        {data.name} thinks they're too cool to write a bio...
                                    </p>
                                )}
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}
