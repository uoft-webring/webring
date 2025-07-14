"use client";
import { getUserInfo } from "@/app/dashboard/actions";
import React, { useEffect, useState } from "react";
import Loading from "./loadingComponent";
import Image from "next/image";
import { UserType } from "@/utils/zod";
import { Button } from "./ui/button";
import SkillTag from "./skillTag";

import closeIcon from "@/icons/close.svg";
import gitHubIcon from "@/icons/gitHub.svg";
import portfolioIcon from "@/icons/portfolio.svg";
import verifiedIcon from "@/icons/verified.svg";
import Link from "next/link";
import FallbackImage from "./fallbackImage";
import { cn } from "@/lib/utils";

export default function ProfileCard({
    userData,
    className,
    ...props
}: {
    userData: any;
} & React.ComponentPropsWithoutRef<"div">) {
    // const [userData, setUserData] = useState<UserType | undefined>(undefined);

    /* useEffect(() => {
        const fetchData = async () => {
            const { user, error } = await getUserInfo();

            if (!user) {
                // TODO: Handle this error (if user exists but isn't in the profile database)
            } else {
                console.log(user);
                setUserData(user);
            }
        };

        fetchData();
    }, []); */

    return (
        <div
            className={cn(
                "w-full max-w-120 mx-auto mt-2 bg-card rounded-xl p-6 min-h-115",
                className
            )}
            {...props}
        >
            {userData ? (
                <>
                    <div className="flex mb-8 items-center">
                        {userData.github_url && (
                            <Link href={userData.github_url} target="_blank">
                                <Image
                                    src={gitHubIcon}
                                    alt="GitHub"
                                    className="size-8 mr-2"
                                />
                            </Link>
                        )}
                        <Link href={userData.domain} target="_blank">
                            <Image
                                src={portfolioIcon}
                                alt="GitHub"
                                className="size-8"
                            />
                        </Link>
                        {/* <Image
                            src={closeIcon}
                            alt="Close"
                            className="ml-auto size-8"
                        /> */}
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-32 aspect-square rounded-full mb-4 relative">
                            <FallbackImage
                                src={userData.image_url}
                                ringId={userData.ring_id}
                                className={`rounded-full w-32 aspect-square ${
                                    userData.is_verified &&
                                    "border-4 border-card outline-4 outline-white"
                                }`}
                                alt="Profile picture"
                            />
                            {userData.is_verified && (
                                <Image
                                    src={verifiedIcon}
                                    alt="Verified"
                                    className="absolute right-0 bottom-0 size-8"
                                />
                            )}
                        </div>
                        <h2 className="text-2xl">{userData.name}</h2>
                        <div className="flex flex-row gap-2 mb-8">
                            {userData.tags?.map(
                                (tagName: string, index: number) => {
                                    return (
                                        <SkillTag
                                            key={index}
                                            tagName={tagName}
                                            index={index}
                                        />
                                    );
                                }
                            )}
                        </div>
                    </div>
                    <p>{userData.tagline}</p>
                </>
            ) : (
                <div className="flex justify-center items-center">
                    <Loading />
                </div>
            )}
        </div>
    );
}
