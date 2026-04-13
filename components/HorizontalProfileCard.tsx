import { cn } from "@/lib/utils";
import { SafeUserType } from "@/utils/zod";
import { ChevronRight, ExternalLink } from "lucide-react";
import Avatar from "./Avatar";
import Link from "next/link";

export default function HorizontalProfileCard({
    user,
    className,
}: {
    user: SafeUserType;
    className?: string;
} & React.ComponentPropsWithoutRef<"div">) {
    if (!user) return null;

    const hostname = user.domain?.replace(/^https?:\/\/(www\.)?/i, "");

    return (
        <div
            className={cn(
                "bg-card flex h-fit w-full flex-row flex-wrap items-center justify-between gap-4 rounded-xl border p-6 shadow-md",
                className
            )}
        >
            <Link
                href={`/u/${user.slug}`}
                className="flex min-w-0 flex-row items-center gap-3 sm:gap-6"
            >
                <Avatar user={user} className="h-14 w-14 shrink-0 sm:h-20 sm:w-20" verifiedSize="size-6 sm:size-9" />

                <div className="min-w-0 text-left">
                    <h2 className="truncate text-xl font-semibold capitalize underline-offset-4 hover:underline sm:[font-size:clamp(1.5rem,2vw+1rem,2.25rem)]">
                        {user.name}
                        <ChevronRight className="ml-1 inline h-5 w-5 opacity-40" />
                    </h2>
                    {(user.program || user.graduation_year) && (
                        <p className="truncate text-sm sm:[font-size:clamp(0.875rem,1vw+0.5rem,1rem)]">
                            {user.program}
                            {user.program && user.graduation_year && " • "}
                            {user.graduation_year}
                        </p>
                    )}
                </div>
            </Link>

            {/* External links */}
            {(user.domain || user.github_url) && <div className="flex w-full flex-row justify-around sm:w-auto sm:flex-col sm:items-center sm:gap-4">
                {user.domain && (
                    <LinkButton
                        url={user.domain}
                        text={hostname ?? user.domain}
                        shortText="Portfolio"
                        aria-label={`Open ${user.name}'s website`}
                    />
                )}
                {user.github_url && (
                    <LinkButton
                        url={`https://github.com/${user.github_url}`}
                        text={user.github_url}
                        shortText="GitHub"
                        aria-label={`Open ${user.name}'s GitHub`}
                    />
                )}
            </div>}
        </div>
    );
}

export function LinkButton({
    url,
    text,
    shortText,
    className,
    "aria-label": ariaLabel,
    ...rest
}: {
    url: string;
    text: string;
    shortText: string;
} & React.ComponentPropsWithoutRef<"button">) {
    const label = text.length <= 30 ? text : (shortText ?? text);
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener"
            aria-label={ariaLabel}
            className={cn(
                "text-primary underline-offset-4 hover:underline",
                "flex flex-row items-center justify-center gap-2",
                "rounded-full border px-5 py-2.5 text-sm sm:border-0 sm:p-0 sm:text-lg sm:hover:no-underline",
                "bg-card sm:bg-transparent",
                className
            )}
        >
            <span className="capitalize sm:hidden">{shortText}</span>
            <span className="hidden sm:inline">{label}</span>
            <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
    );
}
