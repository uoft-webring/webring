"use client";

import Image from "next/image";
import { createAvatar } from "@dicebear/core";
import { personas } from "@dicebear/collection";
import verifiedIcon from "@/icons/verified.svg";
import { cn } from "@/lib/utils";
import { SafeUserType } from "@/utils/zod";

import type { ImageLoaderProps } from "next/image";
type AvatarProps = {
    user: SafeUserType;
    className?: string;
    verifiedSize?: string;
    width?: number;
    height?: number;
};

// Docs: https://aws.amazon.com/developer/application-security-performance/articles/image-optimization
function cloudfrontLoader({ src, width }: ImageLoaderProps) {
    /* I bet not even Guilermo Rauch can figure out how to load cloudfront images without this loader */
    const url = new URL(`https://${process.env.NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN}/${src}`);
    url.searchParams.set("format", "avif");
    url.searchParams.set("width", width.toString());
    url.searchParams.set("quality", (40).toString());
    return url.href;
}

export default function Avatar({ user, className, verifiedSize = "size-9", width, height }: AvatarProps) {
    const alt = `${user.name}'s profile picture`;
    const classList = cn(
        "aspect-square object-cover pointer-events-none select-none rounded-full",
        className
    );
    const seed = user.name || "user";
    const svg = createAvatar(personas, {
        seed: seed.toString(),
        size: width || 90,
    }).toDataUri();

    return (
        <div className="relative aspect-square rounded-full ring-2">
            {user.image_key ? (
                <Image
                    loader={cloudfrontLoader}
                    src={user.image_key}
                    alt={alt}
                    priority={false}
                    width={width || 90}
                    height={height || 90}
                    draggable={false}
                    className={classList}
                    loading="lazy"
                    fetchPriority="high" /* https://web.dev/articles/image-cdns#lcp-effects */
                />
            ) : (
                <Image
                    src={svg}
                    width={width || 90}
                    height={height || 90}
                    alt={alt}
                    className={classList}
                    draggable={false}
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
