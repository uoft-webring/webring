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
                "w-full z-50 bg-card cursor-pointer hover:underline rounded-xl shadow-md p-6 flex flex-row flex-wrap items-center justify-between gap-4 h-fit border",
                className
            )}
        >
            <div className="flex flex-row gap-6 items-center flex-wrap ">
                <Avatar user={user} className="w-20 h-20" />

                <div className="text-left">
                    <h2 className="font-semibold capitalize [font-size:clamp(1.5rem,2vw+1rem,2.25rem)]">
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
            <div className="hidden sm:flex sm:flex-col flex-row gap-2 sm:gap-4 sm:items-center">
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
                "w-max text-lg p-0",
                className,
                "text-primary underline-offset-4 hover:underline sm:hover:no-underline",
                "flex flex-row items-center justify-center gap-2"
            )}
        >
            <span className="sm:hidden capitalize">{shortText}</span>
            <span className="hidden sm:inline">{label}</span>
            <ExternalLink aria-hidden />
        </a>
    );
}
