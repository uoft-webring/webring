import Loading from "./LoadingComponent";
import Image from "next/image";
import SkillTag from "./SkillTag";
import gitHubIcon from "@/icons/gitHub.svg";
import portfolioIcon from "@/icons/portfolio.svg";
import { cn } from "@/lib/utils";
import { SafeUserType } from "@/utils/zod";
import Avatar from "./Avatar";

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
                "min-w-[18rem] max-w-md mx-auto mt-6 bg-card rounded-xl shadow-md p-6 flex flex-col items-center gap-4 sm:h-[30rem] min-h-max border",
                className
            )}
        >
            {/* Ensure Avatar provides intrinsic size (or pass width/height via its API) */}
            <Avatar user={user} className="w-32 h-32" />

            <h2 className="text-2xl font-semibold capitalize text-center">{user.name}</h2>

            {!!user.tags?.length && (
                <div className="flex flex-row flex-wrap gap-2 justify-center">
                    {user.tags.map((tagName: string) => (
                        <SkillTag key={tagName} tagName={tagName} />
                    ))}
                </div>
            )}

            {user.tagline && <p className="text-center normal-case text-pretty">{user.tagline}</p>}

            <div className="flex flex-row flex-wrap justify-center gap-4 items-center mt-auto">
                {user.github_url && (
                    <a
                        href={`https://github.com/${user.github_url}`}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="flex items-center text-wrap normal-case"
                    >
                        <Image
                            src={gitHubIcon}
                            alt="GitHub"
                            width={32}
                            height={32}
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
                        className="flex items-center normal-case"
                    >
                        <Image
                            src={portfolioIcon}
                            alt="Website"
                            width={32}
                            height={32}
                            decoding="async"
                            className="mr-2"
                        />
                        {domainLabel && domainLabel.length <= 30 ? domainLabel : "Portfolio"}
                    </a>
                )}
            </div>
        </div>
    );
}
