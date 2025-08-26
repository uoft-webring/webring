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

export default function FallbackImage({
    src,
    seed,
    className = "",
    alt = "",
    width = 128,
    height = 128,
}: FallbackImageProps) {
    const [imageError, setImageError] = useState(false);
    // Instead of using a dynamic fallback image, we use a local one
    console.log("navbar profile seed", seed);
    const avatar = useMemo(() => {
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

    return imageError || !src ? (
        <Image
            draggable={false}
            priority={false}
            width={width}
            height={height}
            src={avatar}
            alt="Avatar"
            className={cn("object-cover bg-popover", className)}
        />
    ) : (
        <Image
            src={src}
            width={width}
            height={height}
            className={cn("object-cover bg-popover", className)}
            alt={alt}
            onError={(err) => {
                console.log("[FallbackImage] Profile Image error! Switching to fallback: ", err);
                setImageError(true);
            }}
            crossOrigin="anonymous"
            priority={false}
            loading="lazy"
            unoptimized // Optimized Images won't allow arb. domains
        />
    );
}
