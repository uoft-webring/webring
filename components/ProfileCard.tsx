import Link from "next/link";
import gitHubIcon from "@/icons/gitHub.svg";
import portfolioIcon from "@/icons/portfolio.svg";
import { cn } from "@/lib/cn";
import type { PublicProfile } from "@/lib/profiles/types";
import { displayDomain, profilePath, profileUrl } from "@/lib/site";
import { Avatar } from "./Avatar";
import { ExternalLinkPill } from "./ExternalLinkPill";
import { OpenToWorkBadge } from "./OpenToWorkBadge";
import { ShareButton } from "./ShareButton";
import { SkillTag } from "./SkillTag";

export function ProfileCard({
    profile,
    className,
    priority = false,
    linked = true,
}: {
    profile: PublicProfile;
    className?: string;
    priority?: boolean;
    /** Whole card opens the member's page. Off in the editor's live preview, where a stray click would leave unsaved changes. */
    linked?: boolean;
}): React.JSX.Element {
    const href = linked && profile.slug ? profilePath(profile.slug) : null;

    return (
        <div
            className={cn(
                "bg-card relative mx-auto mt-6 flex h-full w-full max-w-[25rem] flex-1 flex-col items-center rounded-xl border p-6 text-center shadow-sm transition hover:shadow-md",
                href && "hover:border-primary/40",
                className
            )}
        >
            {/* Centred in any spare height (carousel slots share one min height), so short cards don't leave a gap above the links */}
            <div className="flex w-full flex-1 flex-col items-center justify-center">
                <Avatar
                    profile={profile}
                    className="ring-primary/20 size-20"
                    verifiedSize="size-6"
                    size={80}
                    priority={priority}
                />

                <h2 className="mt-4 text-xl leading-tight font-semibold capitalize">
                    {href ? (
                        // Links can't nest, so the name's link stretches over the card (::after) and the
                        // footer links sit above it
                        <Link
                            href={href}
                            className="focus-visible:after:outline-ring after:absolute after:inset-0 after:rounded-xl after:content-[''] hover:underline focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2"
                        >
                            {profile.name}
                        </Link>
                    ) : (
                        profile.name
                    )}
                </h2>

                {(profile.program || profile.graduationYear) && (
                    <p className="text-muted-foreground mt-1 flex flex-wrap justify-center gap-x-2 text-base">
                        {profile.program && <span>{profile.program}</span>}
                        {profile.program && profile.graduationYear && <span aria-hidden>·</span>}
                        {profile.graduationYear && <span>{profile.graduationYear}</span>}
                    </p>
                )}
                {profile.openToWork && <OpenToWorkBadge className="mt-3" />}

                {profile.tagline && (
                    <p className="text-foreground/90 mt-4 max-w-md text-base text-pretty break-words hyphens-auto normal-case">
                        {profile.tagline}
                    </p>
                )}

                {profile.tags.length > 0 && (
                    <div className="mt-4 flex flex-row flex-wrap justify-center gap-1.5">
                        {profile.tags.map((tag) => (
                            <SkillTag key={tag} tagName={tag} size="mini" className="text-sm" />
                        ))}
                    </div>
                )}
            </div>

            <div className="relative z-10 w-full pt-5">
                <div className="flex items-center gap-1 border-t pt-4 [&_img]:size-5">
                    {profile.domain && (
                        <ExternalLinkPill
                            href={profile.domain}
                            icon={portfolioIcon}
                            label={displayDomain(profile.domain)}
                            fallbackLabel="Portfolio"
                            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 mr-auto min-h-10 bg-transparent px-3 py-2 text-sm"
                        />
                    )}
                    {profile.githubUsername && (
                        // Label stays as (screen-reader) link text; visually it's an icon button
                        <ExternalLinkPill
                            href={`https://github.com/${profile.githubUsername}`}
                            icon={gitHubIcon}
                            label={`${profile.githubUsername} on GitHub`}
                            fallbackLabel="GitHub"
                            className="hover:bg-muted/50 ml-auto size-10 justify-center bg-transparent p-0 [&>span]:sr-only"
                        />
                    )}
                    {profile.slug && (
                        <ShareButton
                            title={`${profile.name}'s Profile`}
                            url={profileUrl(profile.slug)}
                            compact
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
