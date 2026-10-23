import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck, Globe, Link2, UserIcon } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ExternalLinkPill } from "@/components/ExternalLinkPill";
import { GitHubIcon } from "@/components/GitHubIcon";
import { Markdown } from "@/components/Markdown";
import { Navbar } from "@/components/Navbar";
import { OpenToWorkBadge } from "@/components/OpenToWorkBadge";
import { ExperienceLine } from "@/components/profile-page/ExperienceLine";
import { ProjectsSection } from "@/components/profile-page/ProjectsSection";
import { ShareButton } from "@/components/ShareButton";
import { SitePreview } from "@/components/SitePreview";
import { SkillTag } from "@/components/SkillTag";
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
    const [{ data: profile, error }, viewer] = await Promise.all([
        getPublicProfileBySlug(slug),
        getViewerProfile(),
    ]);

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

            {/* One column at every width: a sidebar card only fit from lg up and stacked awkwardly below it */}
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pt-4 pb-16">
                {isOwner && pageIsEmpty && (
                    <p className="text-muted-foreground rounded-xl border border-dashed p-5 text-base">
                        This is your public page. Add a longer about section, your projects and your
                        experience in{" "}
                        <Link href="/dashboard/page" className="text-foreground underline underline-offset-4">
                            Customize page
                        </Link>
                        .
                    </p>
                )}

                <header className="bg-card rounded-xl border p-6 sm:p-8">
                    <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
                        {/* The member's accent as a ring around the photo, with a gap so it doesn't touch the avatar's own edge */}
                        <div className="shrink-0 rounded-full border-2 border-(--profile-accent) p-1">
                            <Avatar
                                profile={profile}
                                className="size-28"
                                verifiedSize="size-8"
                                size={112}
                                priority
                            />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col items-center sm:items-start">
                            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-start">
                                <h1 className="m-0 text-3xl leading-tight font-semibold capitalize">
                                    {profile.name}
                                </h1>
                                {profile.isVerified && (
                                    <span className="text-chart-3 inline-flex items-center gap-1 text-sm font-medium">
                                        <CircleCheck className="size-4" aria-hidden />
                                        Verified
                                    </span>
                                )}
                            </div>

                            {(profile.program || profile.graduationYear) && (
                                <p className="text-muted-foreground mt-1 flex flex-wrap justify-center gap-x-2 text-base sm:justify-start">
                                    {profile.program && (
                                        <Link
                                            href={topicPath("programs", profile.program)}
                                            className="hover:text-foreground underline-offset-4 hover:underline"
                                        >
                                            {profile.program}
                                        </Link>
                                    )}
                                    {profile.program && profile.graduationYear && <span aria-hidden>·</span>}
                                    {profile.graduationYear && <span>Class of {profile.graduationYear}</span>}
                                </p>
                            )}

                            {profile.openToWork && <OpenToWorkBadge className="mt-3" />}

                            {profile.tagline ? (
                                <p className="text-foreground/90 mt-4 max-w-[60ch] text-lg text-pretty break-words">
                                    {profile.tagline}
                                </p>
                            ) : (
                                !content.about && (
                                    <p className="text-muted-foreground mt-4 text-base italic">
                                        {profile.name} thinks they&apos;re too cool to write a bio...
                                    </p>
                                )
                            )}

                            {profile.tags.length > 0 && (
                                <ul
                                    aria-label="Interests"
                                    className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start"
                                >
                                    {profile.tags.map((tagName) => (
                                        <li key={tagName}>
                                            <Link
                                                href={topicPath("tags", tagName)}
                                                className="hover:opacity-80"
                                            >
                                                <SkillTag tagName={tagName} size="mini" className="text-sm" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t pt-5 sm:justify-start">
                        {profile.domain && (
                            <ExternalLinkPill
                                href={profile.domain}
                                icon={<Globe />}
                                label={displayDomain(profile.domain)}
                                fallbackLabel="Portfolio"
                            />
                        )}
                        {profile.githubUsername && (
                            <ExternalLinkPill
                                href={`https://github.com/${profile.githubUsername}`}
                                icon={<GitHubIcon />}
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
                        <div className="sm:ml-auto">
                            <ShareButton
                                title={`${profile.name}'s UofT Webring Profile`}
                                url={profileUrl(profile.slug)}
                            />
                        </div>
                    </div>
                </header>

                {content.about && (
                    <section className="bg-card rounded-xl border p-6 sm:p-8" aria-labelledby="about">
                        <h2
                            id="about"
                            className="mb-4 flex items-center gap-3 text-xl font-semibold capitalize"
                        >
                            <UserIcon className="size-6 text-(--profile-accent)" aria-hidden />
                            About {profile.name}
                        </h2>
                        <Markdown className="text-muted-foreground">{content.about}</Markdown>
                    </section>
                )}
                {content.projects.length > 0 && <ProjectsSection projects={content.projects} />}
                {content.experience.length > 0 && <ExperienceLine experience={content.experience} />}
                {isLinkableDomain(profile.domain) && (
                    <section aria-label={`Preview of ${profile.name}'s website`}>
                        <SitePreview ringId={profile.ringId} domain={profile.domain} />
                    </section>
                )}
            </div>
        </div>
    );
}
