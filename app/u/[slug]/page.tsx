import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Book, CircleCheck, GraduationCap, Link2, TagIcon, UserIcon } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ExternalLinkPill } from "@/components/ExternalLinkPill";
import { Markdown } from "@/components/Markdown";
import { Navbar } from "@/components/Navbar";
import { OpenToWorkBadge } from "@/components/OpenToWorkBadge";
import { ExperienceLine } from "@/components/profile-page/ExperienceLine";
import { ProjectsSection } from "@/components/profile-page/ProjectsSection";
import { ShareButton } from "@/components/ShareButton";
import { SitePreview } from "@/components/SitePreview";
import { SkillTag } from "@/components/SkillTag";
import gitHubIcon from "@/icons/gitHub.svg";
import portfolioIcon from "@/icons/portfolio.svg";
import { ACCENT_COLORS } from "@/lib/accents";
import { getViewerProfile } from "@/lib/auth";
import { avatarUrl } from "@/lib/avatar";
import { getPostHogClient } from "@/lib/posthog-server";
import { getPageContent } from "@/lib/profiles/page";
import { getPublicProfileBySlug } from "@/lib/profiles/queries";
import { isLinkableDomain } from "@/lib/profiles/ring";
import { topicPath } from "@/lib/profiles/topics";
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
    const content = await getPageContent(profile.ringId);
    const isOwner = viewer?.slug === profile.slug;
    const pageIsEmpty = !content.about && content.projects.length === 0 && content.experience.length === 0;

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
                ...content.links.map((link) => link.url),
            ],
        },
        ...(profile.domain && { relatedLink: profile.domain }),
    };

    return (
        <div
            className="bg-background text-foreground flex min-h-screen flex-col"
            style={{ "--profile-accent": ACCENT_COLORS[content.accent].color } as React.CSSProperties}
        >
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
                                {profile.imageKey && (
                                    // The member's accent as a ring around the photo, with a gap so it doesn't touch the avatar's own edge
                                    <div className="rounded-full border-4 border-(--profile-accent) p-1.5">
                                        <Avatar profile={profile} className="h-32 w-32" priority />
                                    </div>
                                )}

                                <h2 className="py-2 text-center text-2xl font-bold capitalize">
                                    {profile.name}
                                </h2>

                                {profile.isVerified && (
                                    <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-green-500">
                                        <CircleCheck className="stroke-background h-4 w-4 fill-green-500" />
                                        Verified
                                    </div>
                                )}
                                {profile.openToWork && <OpenToWorkBadge className="mt-2" />}

                                <div className="border-border my-6 w-full border-t" />

                                <div className="text-muted-foreground w-full space-y-4">
                                    {profile.program && (
                                        <div className="flex items-center gap-5">
                                            <Book className="text-primary h-5 w-5 shrink-0" />
                                            <div>
                                                <p className="text-foreground font-semibold">
                                                    <Link href={topicPath("programs", profile.program)} className="hover:underline">
                                                        {profile.program}
                                                    </Link>
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
                                    {content.links.map((link) => (
                                        <ExternalLinkPill
                                            key={link.url}
                                            href={link.url}
                                            icon={<Link2 className="size-5" />}
                                            label={link.label}
                                            fallbackLabel="Link"
                                        />
                                    ))}
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
                                        <Link key={tagName} href={topicPath("tags", tagName)} className="hover:opacity-80">
                                            <SkillTag tagName={tagName} />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>

                    <main className="space-y-10 lg:col-span-3">
                        {isOwner && pageIsEmpty && (
                            <p className="text-muted-foreground border-border rounded-2xl border border-dashed p-5 text-sm">
                                This is your public page. Add a longer about section, your projects and your experience
                                in{" "}
                                <Link href="/dashboard/page" className="text-foreground underline underline-offset-4">
                                    Customize page
                                </Link>
                                .
                            </p>
                        )}
                        <section className="bg-card border-border rounded-3xl border p-5 shadow-lg sm:p-10">
                            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold capitalize sm:text-3xl">
                                <UserIcon className="text-primary h-7 w-7" />
                                About {profile.name}
                            </h2>
                            <div className="space-y-5">
                                {profile.tagline && content.about ? (
                                    <>
                                        <p className="text-foreground text-lg text-pretty break-words">{profile.tagline}</p>
                                        <Markdown className="text-muted-foreground">{content.about}</Markdown>
                                    </>
                                ) : content.about ? (
                                    <Markdown className="text-muted-foreground">{content.about}</Markdown>
                                ) : profile.tagline ? (
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
                        {content.projects.length > 0 && <ProjectsSection projects={content.projects} />}
                        {content.experience.length > 0 && <ExperienceLine experience={content.experience} />}
                        {isLinkableDomain(profile.domain) && (
                            <section aria-label={`Preview of ${profile.name}'s website`}>
                                <SitePreview ringId={profile.ringId} domain={profile.domain} className="shadow-lg" />
                            </section>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
