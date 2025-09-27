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
        <div className="bg-background text-foreground flex min-h-screen flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
                }}
            />

            <Navbar user={data} />

            <div className="container mx-auto max-w-7xl flex-1 px-6 py-5">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
                    {/* Profile Sidebar */}
                    <aside className="space-y-8 lg:col-span-1">
                        <div className="bg-card border-border sticky top-8 rounded-3xl border p-8 shadow-lg">
                            <div className="flex flex-col items-center text-center">
                                {data.image_key && <Avatar user={data} className="h-32 w-32" />}

                                <h2 className="py-2 text-center text-2xl font-bold capitalize">
                                    {data.name}
                                </h2>

                                {data.is_verified && (
                                    <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-green-500">
                                        <CheckCircle className="stroke-background h-4 w-4 fill-green-500" />
                                        Verified
                                    </div>
                                )}

                                <div className="border-border my-6 w-full border-t" />

                                <div className="text-muted-foreground w-full space-y-4">
                                    {data.program && (
                                        <div className="flex items-center gap-5">
                                            <Book className="text-primary h-5 w-5 shrink-0" />
                                            <div>
                                                <p className="text-foreground font-semibold">
                                                    {data.program}
                                                </p>
                                                <p className="text-sm">Program</p>
                                            </div>
                                        </div>
                                    )}
                                    {data.graduation_year && (
                                        <div className="flex items-center gap-5">
                                            <GraduationCap className="text-primary h-5 w-5 shrink-0" />
                                            <div>
                                                <p className="text-foreground font-semibold">
                                                    Class of {data.graduation_year}
                                                </p>
                                                <p className="text-sm">Graduation Year</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="border-border my-6 w-full border-t" />

                                <div className="flex w-full flex-col gap-3">
                                    {data.domain && (
                                        <a
                                            href={data.domain}
                                            target="_blank"
                                            rel="noopener noreferrer nofollow"
                                            className="bg-popover hover:bg-secondary/80 flex items-center rounded-full px-3 py-2.5 text-sm transition"
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
                                            className="bg-popover hover:bg-secondary/80 flex items-center rounded-full px-3 py-2.5 text-sm transition"
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
                                        url={`${process.env.NEXT_PUBLIC_HOME_DOMAIN}/u/${data.slug}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {!!data.tags?.length && (
                            <div className="bg-card border-border rounded-2xl border p-6 shadow">
                                <h3 className="border-border mb-3 flex items-center gap-2 border-b pb-2 text-lg font-semibold">
                                    <TagIcon className="text-primary h-5 w-5" />
                                    Interests
                                </h3>

                                <div className="flex flex-row flex-wrap justify-center gap-2">
                                    {data.tags.map((tagName: string) => (
                                        <SkillTag key={tagName} tagName={tagName} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>

                    <main className="space-y-10 lg:col-span-3">
                        <section className="bg-card border-border rounded-3xl border p-10 shadow-lg">
                            <h2 className="mb-6 flex items-center gap-3 text-3xl font-bold capitalize">
                                <UserIcon className="text-primary h-7 w-7" />
                                About {data.name}
                            </h2>
                            <div className="prose prose-xl prose-a:text-primary prose-strong:text-foreground max-w-none">
                                {data.tagline ? (
                                    <p className="text-md text-muted-foreground flex-1 px-4 text-pretty break-all hyphens-auto normal-case">
                                        {data.tagline}
                                    </p>
                                ) : (
                                    <p className="text-md text-muted-foreground italic">
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
