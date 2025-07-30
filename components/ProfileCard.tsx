"use client";
import Loading from "./LoadingComponent";
import Image from "next/image";
import SkillTag from "./SkillTag";
import gitHubIcon from "@/icons/gitHub.svg";
import portfolioIcon from "@/icons/portfolio.svg";
import verifiedIcon from "@/icons/verified.svg";
import Link from "next/link";
import FallbackImage from "./FallbackImage";
import { cn } from "@/lib/utils";
import { SafeUserType } from "@/utils/zod";

export default function ProfileCard({
    user,
    className,
}: {
    user: SafeUserType;
} & React.ComponentPropsWithoutRef<"div">) {
    if (!user) {
        return <Loading />;
    }

    const domainUrl = user.domain?.replace(/^https?:\/\/(www\.)?/, "");
    return (
        <div
            className={cn(
                "min-w-[20rem] max-w-md mx-auto mt-6 bg-card rounded-xl shadow-md p-6 flex flex-col items-center gap-4 sm:h-[30rem] min-h-max border-1",
                className
            )}
        >
            <div className="w-32 aspect-square rounded-full mb-4 relative">
                <FallbackImage
                    key={user.image_url + user.ring_id}
                    src={user.image_url}
                    ringId={user.ring_id}
                    alt="Profile picture"
                    className={cn(
                        "rounded-full w-32 aspect-square object-cover",
                        user.is_verified &&
                            "border-4 border-card outline outline-white"
                    )}
                />
                {user.is_verified && (
                    <Image
                        src={verifiedIcon}
                        alt="Verified"
                        className="absolute right-0 bottom-0 size-8"
                    />
                )}
            </div>
            <h2 className="text-2xl font-semibold">{user.name}</h2>{" "}
            <div className="flex flex-row flex-wrap gap-2 mb-8 justify-center">
                {user.tags?.map((tagName: string, index: number) => {
                    return <SkillTag key={index} tagName={tagName} />;
                })}
            </div>
            <p className="text-wrap break-all text-center mb-4">
                {user.tagline}
            </p>
            <div className="flex flex-row flex-wrap justify-center gap-4  items-center">
                {user.github_url && (
                    <Link
                        href={user.github_url}
                        target="_blank"
                        className="flex items-center"
                    >
                        <Image
                            src={gitHubIcon}
                            alt="GitHub"
                            className="size-8 mr-2"
                        />
                        {/* When we migrate to just github_username we won't need this */}
                        {user.github_url
                            ?.split("github.com/")[1]
                            ?.split("/")[0] || ""}
                    </Link>
                )}
                <Link
                    href={user.domain}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex items-center"
                >
                    <Image
                        src={portfolioIcon}
                        alt="Website"
                        className="size-8 mr-2"
                    />
                    {domainUrl && domainUrl.length <= 30
                        ? domainUrl
                        : "Portfolio"}
                </Link>
            </div>
        </div>
    );
}
