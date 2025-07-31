"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

type FallbackImageProps = {
    src?: string;
    ringId: number;
    className?: string;
    alt?: string;
    width?: number;
    height?: number;
};

function FallbackImage({
    src,
    ringId,
    className = "",
    alt = "",
    width = 128,
    height = 128,
}: FallbackImageProps) {
    const [imageError, setImageError] = useState(false);
    const fallbackSrc = `https://api.dicebear.com/9.x/bottts-neutral/png?seed=${ringId}&radius=50`;

    useEffect(() => {
        setImageError(false);
    }, [src]);

    return (
        <Image
            src={imageError || !src ? fallbackSrc : src}
            width={width}
            height={height}
            className={`object-cover ${className}`}
            alt={alt}
            onError={(err) => {
                console.log(
                    "[FallbackImage] Profile Image error! Switching to fallback: ",
                    err
                );
                setImageError(true);
            }}
            priority={false}
            loading="lazy"
            unoptimized // Optimized Images won't allow arb. domains
        />
    );
}

export default FallbackImage;
