import Loading from "./LoadingComponent";
import Image from "next/image";
import SkillTag from "./SkillTag";
import gitHubIcon from "@/icons/gitHub.svg";
import portfolioIcon from "@/icons/portfolio.svg";
import { cn } from "@/lib/utils";
import { SafeUserType } from "@/utils/zod";
import Avatar from "./Avatar";
import { Share2 } from "lucide-react";
import { Button } from "./ui/button";
import ShareButton from "./ShareButton";

export default function ProfileCard({
    user,
    className,
}: {
    user: SafeUserType;
    className?: string;
} & React.ComponentPropsWithoutRef<"div">) {
    if (!user) return <Loading />;

    const domainLabel = user.domain?.replace(/^https?:\/\/(www\.)?/i, "");

    return (
        <div
            className={cn(
                "bg-card mx-auto mt-6 flex h-[40rem] min-h-fit w-[20rem] max-w-md min-w-[18rem] flex-col items-center gap-4 rounded-2xl border p-6 shadow-lg transition hover:shadow-xl sm:h-[32rem] md:w-[22rem] lg:w-[26.5rem]",
                className
            )}
        >
            <Avatar user={user} className="ring-primary/20 h-26 w-26 rounded-full" />

            <h2 className="text-center text-2xl font-bold capitalize">{user.name}</h2>

            <div className="text-muted-foreground flex flex-wrap justify-center gap-2 text-sm">
                {user.program && <span>{user.program}</span>}
                {user.program && user.graduation_year && <p>·</p>}
                {user.graduation_year && <span>{user.graduation_year}</span>}
            </div>

            {!!user.tags?.length && (
                <div className="flex flex-row flex-wrap justify-center gap-2">
                    {user.tags.map((tagName: string) => (
                        <SkillTag key={tagName} tagName={tagName} />
                    ))}
                </div>
            )}

            <p className="text-muted-foreground max-w-md flex-1 px-4 text-center text-sm text-pretty break-words hyphens-auto normal-case">
                {user.tagline && user.tagline}
            </p>
            <div className="mb-2 flex flex-row flex-wrap items-center justify-center gap-4">
                {user.github_url && (
                    <a
                        href={`https://github.com/${user.github_url}`}
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
                        {user.github_url.length <= 30 ? user.github_url : "GitHub"}
                    </a>
                )}

                {user.domain && (
                    <a
                        href={user.domain}
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
                        {domainLabel && domainLabel.length <= 30 ? domainLabel : "Portfolio"}
                    </a>
                )}

                <ShareButton
                    title={`${user.name}'s Profile`}
                    url={`${process.env.NEXT_PUBLIC_HOME_DOMAIN}/u/${user.slug}`}
                />
            </div>
        </div>
    );
}
