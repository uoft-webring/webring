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
}: {
    profile: PublicProfile;
    className?: string;
    priority?: boolean;
}): React.JSX.Element {
    return (
        <div
            className={cn(
                "bg-card mx-auto mt-6 flex h-full w-full max-w-[25rem] flex-1 flex-col items-center gap-4 rounded-2xl border p-6 shadow-lg transition hover:shadow-xl",
                className
            )}
        >
            <Avatar profile={profile} className="ring-primary/20 h-26 w-26 rounded-full" priority={priority} />

            <h2 className="text-center text-2xl font-bold capitalize hover:underline">
                {profile.slug ? <Link href={profilePath(profile.slug)}>{profile.name}</Link> : profile.name}
            </h2>

            <div className="text-muted-foreground flex flex-wrap justify-center gap-2 text-sm">
                {profile.program && <span>{profile.program}</span>}
                {profile.program && profile.graduationYear && <span aria-hidden>·</span>}
                {profile.graduationYear && <span>{profile.graduationYear}</span>}
            </div>
            {profile.openToWork && <OpenToWorkBadge />}

            {profile.tags.length > 0 && (
                <div className="flex flex-row flex-wrap justify-center gap-2">
                    {profile.tags.map((tag) => (
                        <SkillTag key={tag} tagName={tag} />
                    ))}
                </div>
            )}

            <p className="text-muted-foreground max-w-md flex-1 px-4 text-center text-sm text-pretty break-words hyphens-auto normal-case">
                {profile.tagline}
            </p>
            <div className="mb-2 flex flex-row flex-wrap items-center justify-center gap-4">
                {profile.githubUsername && (
                    <ExternalLinkPill
                        href={`https://github.com/${profile.githubUsername}`}
                        icon={gitHubIcon}
                        label={profile.githubUsername}
                        fallbackLabel="GitHub"
                    />
                )}
                {profile.domain && (
                    <ExternalLinkPill
                        href={profile.domain}
                        icon={portfolioIcon}
                        label={displayDomain(profile.domain)}
                        fallbackLabel="Portfolio"
                    />
                )}
                {profile.slug && <ShareButton title={`${profile.name}'s Profile`} url={profileUrl(profile.slug)} />}
            </div>
        </div>
    );
}
