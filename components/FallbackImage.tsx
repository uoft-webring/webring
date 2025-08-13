"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { personas } from "@dicebear/collection";

type FallbackImageProps = {
    src?: string;
    // The seed is a deterministic value used to generate a unique avatar
    // Could be a user ID, domain, or any unique identifier
    seed: number;
    className?: string;
    alt?: string;
    width?: number;
    height?: number;
};
/* At some point we can merge this with Avatar.tsx no one else uses */
export default function FallbackImage({
    src,
    seed,
    className = "",
    alt = "",
    width = 32,
    height = 32,
}: FallbackImageProps) {
    const [imageError, setImageError] = useState(false);
    // Instead of using a dynamic fallback image, we use a local one
    console.log("navbar profile seed", seed);
    const avatarDataUri = useMemo(() => {
        return createAvatar(personas, {
            size: 128,
            seed: seed.toString(),
        }).toDataUri();
    }, [seed]);

    useEffect(() => {
        if (!src) {
            console.warn("[FallbackImage] No src provided, using fallback image.");
            setImageError(true);
            return;
        }
        setImageError(false);
    }, [src]);
    console.log("[FallbackImage] Rendering image for ringId:", seed, "with src:", src);
    const classList = cn("aspect-square object-cover pointer-events-none select-none", className);

    return imageError || !src ? (
        <Image
            draggable={false}
            decoding="async"
            priority={false}
            fetchPriority="low"
            width={width}
            height={height}
            src={avatarDataUri}
            quality={80}
            alt={alt || "Avatar"}
            loading="lazy"
            className={classList}
        />
    ) : (
        <Image
            draggable={false}
            decoding="async"
            priority={false}
            fetchPriority="low"
            width={width}
            height={height}
            src={src}
            quality={80}
            alt={alt}
            loading="lazy"
            className={classList}
            crossOrigin="anonymous"
            onError={(err) => {
                // TODO: try this: https://www.npmjs.com/package/broken-link-checker
                console.log("[FallbackImage] Profile Image error! Switching to fallback: ", err);
                setImageError(true);
            }}
            unoptimized // Optimized Images won't allow arb. domains
        />
    );
}
