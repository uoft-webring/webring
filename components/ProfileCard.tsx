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
                "min-w-[18rem] w-[20rem] md:w-[22rem] lg:w-[26.5rem] max-w-md mx-auto mt-6 bg-card rounded-2xl shadow-lg p-6 flex flex-col items-center gap-4 h-[40rem] min-h-fit sm:h-[32rem] border transition hover:shadow-xl",
                className
            )}
        >
            <Avatar user={user} className="w-26 h-26 ring-primary/20 rounded-full" />

            <h2 className="text-2xl font-bold capitalize text-center">{user.name}</h2>

            <div className="flex flex-wrap gap-2 text-muted-foreground text-sm justify-center">
                {user.program && <span>{user.program}</span>}
                {user.program && user.graduation_year && <p>·</p>}
                {user.graduation_year && <span>{user.graduation_year}</span>}
            </div>

            {!!user.tags?.length && (
                <div className="flex flex-row flex-wrap gap-2 justify-center">
                    {user.tags.map((tagName: string) => (
                        <SkillTag key={tagName} tagName={tagName} />
                    ))}
                </div>
            )}

            {user.tagline && (
                <p className="text-center text-sm text-muted-foreground flex-1 px-4 text-pretty normal-case break-all hyphens-auto ">
                    {user.tagline}
                </p>
            )}

            <div className="flex flex-row flex-wrap justify-center gap-4 items-center mb-2">
                {user.github_url && (
                    <a
                        href={`https://github.com/${user.github_url}`}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="flex items-center px-3 py-2.5 rounded-full bg-popover hover:bg-secondary/80 text-sm transition"
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
                        className="flex items-center px-3 py-2.5 rounded-full bg-popover hover:bg-secondary/80 text-sm transition"
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
                    url={`https://${process.env.HOME_DOMAIN}/u/${user.slug}`}
                />
            </div>
        </div>
    );
}
