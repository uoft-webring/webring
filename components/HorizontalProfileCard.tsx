"use client";
import Loading from "./LoadingComponent";
import { cn } from "@/lib/utils";
import { SafeUserType } from "@/utils/zod";
import { ExternalLink } from "lucide-react";
import Avatar from "./Avatar";
import { useRouter } from "next/navigation";

export default function HorizontalProfileCard({
    user,
    className,
}: {
    user: SafeUserType;
    className?: string;
} & React.ComponentPropsWithoutRef<"div">) {
    if (!user) return <Loading />;

    const hostname = user.domain?.replace(/^https?:\/\/(www\.)?/i, "");
    const router = useRouter();

    return (
        <div
            onClick={() => {
                router.push(`/u/${user.slug}`);
            }}
            className={cn(
                "bg-card z-50 flex h-fit w-full cursor-pointer flex-row flex-wrap items-center justify-between gap-4 rounded-xl border p-6 shadow-md hover:underline",
                className
            )}
        >
            <div className="flex flex-row flex-wrap items-center gap-6">
                <Avatar user={user} className="h-20 w-20" />

                <div className="text-left">
                    <h2 className="[font-size:clamp(1.5rem,2vw+1rem,2.25rem)] font-semibold capitalize">
                        {user.name}
                    </h2>
                    {user.graduation_year && user.program && (
                        <p className="[font-size:clamp(0.875rem,1vw+0.5rem,1rem)]">
                            {user.program} • {user.graduation_year}
                        </p>
                    )}
                </div>
            </div>

            {/* Right side: buttons */}
            <div className="hidden flex-row gap-2 sm:flex sm:flex-col sm:items-center sm:gap-4">
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
            </div>
        </div>
    );
}

export function LinkButton({
    url,
    text,
    shortText,
    className,
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
            rel="noopener noreferrer nofollow"
            className={cn(
                "w-max p-0 text-lg",
                className,
                "text-primary underline-offset-4 hover:underline sm:hover:no-underline",
                "flex flex-row items-center justify-center gap-2"
            )}
        >
            <span className="capitalize sm:hidden">{shortText}</span>
            <span className="hidden sm:inline">{label}</span>
            <ExternalLink aria-hidden />
        </a>
    );
}
