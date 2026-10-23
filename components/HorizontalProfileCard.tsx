import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PublicProfile } from "@/lib/profiles/types";
import { displayDomain, profilePath } from "@/lib/site";
import { Avatar } from "./Avatar";
import { OpenToWorkBadge } from "./OpenToWorkBadge";

export function HorizontalProfileCard({
    profile,
    className,
}: {
    profile: PublicProfile;
    className?: string;
}): React.JSX.Element {
    return (
        <div
            className={cn(
                "bg-card hover:border-primary/40 relative flex h-fit w-full flex-row flex-wrap items-center justify-between gap-4 rounded-xl border p-6 shadow-md transition-colors",
                className
            )}
        >
            {/* Stretched link: its ::after covers the card, so a click anywhere opens the member's page */}
            <Link
                href={profilePath(profile.slug)}
                className="group focus-visible:after:ring-ring/50 flex min-w-0 flex-row items-center gap-3 outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:after:ring-[3px] sm:gap-6"
            >
                <Avatar
                    profile={profile}
                    className="h-14 w-14 shrink-0 sm:h-20 sm:w-20"
                    verifiedSize="size-6 sm:size-9"
                />

                <div className="min-w-0 text-left">
                    <h2 className="truncate text-xl font-semibold capitalize underline-offset-4 group-hover:underline sm:[font-size:clamp(1.5rem,2vw+1rem,2.25rem)]">
                        {profile.name}
                        <ChevronRight className="ml-1 inline h-5 w-5 opacity-40" aria-hidden />
                    </h2>
                    {(profile.program || profile.graduationYear) && (
                        <p className="truncate text-sm sm:[font-size:clamp(0.875rem,1vw+0.5rem,1rem)]">
                            {profile.program}
                            {profile.program && profile.graduationYear && " • "}
                            {profile.graduationYear}
                        </p>
                    )}
                    {profile.openToWork && <OpenToWorkBadge className="mt-2" />}
                </div>
            </Link>

            {(profile.domain || profile.githubUsername) && (
                <div className="relative z-10 flex w-full flex-row justify-around gap-2 sm:w-auto sm:flex-col sm:items-end sm:gap-1">
                    {profile.domain && (
                        <LinkButton
                            url={profile.domain}
                            text={displayDomain(profile.domain)}
                            shortText="Portfolio"
                            ariaLabel={`Open ${profile.name}'s website`}
                        />
                    )}
                    {profile.githubUsername && (
                        <LinkButton
                            url={`https://github.com/${profile.githubUsername}`}
                            text={profile.githubUsername}
                            shortText="GitHub"
                            ariaLabel={`Open ${profile.name}'s GitHub`}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function LinkButton({
    url,
    text,
    shortText,
    ariaLabel,
}: {
    url: string;
    text: string;
    shortText: string;
    ariaLabel: string;
}): React.JSX.Element {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabel}
            className={cn(
                "text-primary underline-offset-4 hover:underline",
                "flex flex-row items-center justify-center gap-2",
                "sm:hover:bg-muted/50 min-h-11 rounded-full border px-5 py-2.5 text-sm sm:rounded-lg sm:border-0 sm:px-3 sm:py-2 sm:text-lg sm:hover:no-underline",
                "bg-card sm:bg-transparent"
            )}
        >
            <span className="capitalize sm:hidden">{shortText}</span>
            <span className="hidden sm:inline">{text.length <= 30 ? text : shortText}</span>
            <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
    );
}
