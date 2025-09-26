"use client";
import Image from "next/image";
import verifiedIcon from "@/icons/verified.svg";
import { cn } from "@/lib/utils";
import { SafeUserType } from "@/utils/zod";
type AvatarProps = {
    user: SafeUserType;
    className?: string;
    verifiedSize?: string;
    width?: number;
    height?: number;
};
import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { personas } from "@dicebear/collection";

export default function Avatar({ user, className, verifiedSize = "size-9", width, height }: AvatarProps) {
    const key = user.image_key + user.ring_id;
    // We assume that if a user.image_key doesn't exist then we have to switch to a fallback, otherwise it's valid

    const src = user.image_key
        ? "https://" + process.env.NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN + "/" + user.image_key
        : null;
    const seed = user.ring_id;
    const alt = `${user.name}'s profile picture`;

    const avatarDataUri = useMemo(() => {
        return createAvatar(personas, {
            size: 128,
            seed: seed.toString(),
        }).toDataUri();
    }, [src]);

    const classList = cn(
        "aspect-square object-cover pointer-events-none select-none rounded-full",
        className
    );

    return (
        <div className="relative ring-2 rounded-full aspect-square object-cover">
            {src ? (
                <img
                    alt={alt || "Avatar"}
                    src={src}
                    width={width || 90}
                    height={height || 90}
                    draggable={false}
                    className={classList}
                />
            ) : (
                <Image
                    draggable={false}
                    priority={false}
                    fetchPriority="low"
                    width="50"
                    height="50"
                    src={avatarDataUri}
                    alt={alt || "Avatar"}
                    className={classList}
                />
            )}
            {user.is_verified && (
                <Image
                    src={verifiedIcon}
                    alt={`${user.name}'s verification badge`}
                    aria-hidden
                    priority={false}
                    fetchPriority="low"
                    className={cn("absolute right-0 bottom-0", verifiedSize)}
                />
            )}
        </div>
    );
}
