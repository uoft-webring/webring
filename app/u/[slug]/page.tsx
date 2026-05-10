import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Book, CircleCheck, GraduationCap, TagIcon, UserIcon } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ExternalLinkPill } from "@/components/ExternalLinkPill";
import { Navbar } from "@/components/Navbar";
import { ShareButton } from "@/components/ShareButton";
import { SkillTag } from "@/components/SkillTag";
import gitHubIcon from "@/icons/gitHub.svg";
import portfolioIcon from "@/icons/portfolio.svg";
import { getViewerProfile } from "@/lib/auth";
import { avatarUrl } from "@/lib/avatar";
import { getPostHogClient } from "@/lib/posthog-server";
import { getPublicProfileBySlug } from "@/lib/profiles/queries";
import { displayDomain, profileUrl } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/u/[slug]">): Promise<Metadata> {
    const { slug } = await params;
    const { data: profile } = await getPublicProfileBySlug(slug);
    if (!profile) return { title: "User not found" };

    const url = profileUrl(profile.slug);
    return {
        title: `${profile.name} - UofT Webring`,
        description: profile.tagline || undefined,
        openGraph: {
            title: profile.name,
            description: profile.tagline || undefined,
            url,
        },
        twitter: {
            title: profile.name,
            description: profile.tagline || undefined,
            card: "summary_large_image",
        },
        alternates: { canonical: url },
    };
}

export default async function ProfilePage({ params }: PageProps<"/u/[slug]">) {
    const { slug } = await params;
    const [{ data: profile, error }, viewer] = await Promise.all([getPublicProfileBySlug(slug), getViewerProfile()]);

    if (error !== null) throw new Error(error);
    if (!profile) notFound();

    getPostHogClient().capture({
        distinctId: viewer?.id ?? `anon_${slug}`,
        event: "profile_viewed",
        properties: {
            profile_slug: slug,
            profile_name: profile.name,
            is_verified: profile.isVerified,
            viewer_is_owner: viewer?.ringId === profile.ringId,
        },
    });

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        mainEntity: {
            "@type": "Person",
            name: profile.name,
            identifier: profile.ringId,
            ...(profile.tagline && { description: profile.tagline }),
            ...(avatarUrl(profile.imageKey) && { image: avatarUrl(profile.imageKey) }),
            sameAs: [
                ...(profile.githubUsername ? [`https://github.com/${profile.githubUsername}`] : []),
                ...(profile.domain ? [profile.domain] : []),
            ],
        },
        ...(profile.domain && { relatedLink: profile.domain }),
    };

    return (
        <div className="bg-background text-foreground flex min-h-screen flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
                }}
            />

            <Navbar user={viewer} />

            <div className="container mx-auto max-w-7xl flex-1 px-6 py-5">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
                    {/* Profile Sidebar */}
                    <aside className="space-y-8 self-start lg:sticky lg:top-8 lg:col-span-1">
                        <div className="bg-card border-border rounded-3xl border p-5 shadow-lg sm:p-8">
                            <div className="flex flex-col items-center text-center">
                                {profile.imageKey && <Avatar profile={profile} className="h-32 w-32" priority />}

                                <h2 className="py-2 text-center text-2xl font-bold capitalize">
                                    {profile.name}
                                </h2>

                                {profile.isVerified && (
                                    <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-green-500">
                                        <CircleCheck className="stroke-background h-4 w-4 fill-green-500" />
                                        Verified
                                    </div>
                                )}

                                <div className="border-border my-6 w-full border-t" />

                                <div className="text-muted-foreground w-full space-y-4">
                                    {profile.program && (
                                        <div className="flex items-center gap-5">
                                            <Book className="text-primary h-5 w-5 shrink-0" />
                                            <div>
                                                <p className="text-foreground font-semibold">
                                                    {profile.program}
                                                </p>
                                                <p className="text-sm">Program</p>
                                            </div>
                                        </div>
                                    )}
                                    {profile.graduationYear && (
                                        <div className="flex items-center gap-5">
                                            <GraduationCap className="text-primary h-5 w-5 shrink-0" />
                                            <div>
                                                <p className="text-foreground font-semibold">
                                                    Class of {profile.graduationYear}
                                                </p>
                                                <p className="text-sm">Graduation Year</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="border-border my-6 w-full border-t" />

                                <div className="flex w-full flex-col gap-3">
                                    {profile.domain && (
                                        <ExternalLinkPill
                                            href={profile.domain}
                                            icon={portfolioIcon}
                                            label={displayDomain(profile.domain)}
                                            fallbackLabel="Portfolio"
                                        />
                                    )}
                                    {profile.githubUsername && (
                                        <ExternalLinkPill
                                            href={`https://github.com/${profile.githubUsername}`}
                                            icon={gitHubIcon}
                                            label={profile.githubUsername}
                                            fallbackLabel="GitHub"
                                        />
                                    )}
                                    <ShareButton
                                        title={`${profile.name}'s UofT Webring Profile`}
                                        url={profileUrl(profile.slug)}
                                    />
                                </div>
                            </div>
                        </div>

                        {profile.tags.length > 0 && (
                            <div className="bg-card border-border rounded-2xl border p-6 shadow">
                                <h3 className="border-border mb-3 flex items-center gap-2 border-b pb-2 text-lg font-semibold">
                                    <TagIcon className="text-primary h-5 w-5" />
                                    Interests
                                </h3>

                                <div className="flex flex-row flex-wrap justify-center gap-2">
                                    {profile.tags.map((tagName) => (
                                        <SkillTag key={tagName} tagName={tagName} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>

                    <main className="space-y-10 lg:col-span-3">
                        <section className="bg-card border-border rounded-3xl border p-5 shadow-lg sm:p-10">
                            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold capitalize sm:text-3xl">
                                <UserIcon className="text-primary h-7 w-7" />
                                About {profile.name}
                            </h2>
                            <div className="prose prose-xl prose-a:text-primary prose-strong:text-foreground max-w-none">
                                {profile.tagline ? (
                                    <p className="text-md text-muted-foreground flex-1 px-4 text-pretty break-all hyphens-auto normal-case">
                                        {profile.tagline}
                                    </p>
                                ) : (
                                    <p className="text-md text-muted-foreground italic">
                                        {profile.name} thinks they&apos;re too cool to write a bio...
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
