"use client";

import { useState } from "react";
import Image from "next/image";
import { createAvatar } from "@dicebear/core";
import * as personas from "@dicebear/personas";
import verifiedIcon from "@/icons/verified.svg";
import { avatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/cn";
import type { PublicProfile } from "@/lib/profiles/types";

type AvatarProps = {
    profile: Pick<PublicProfile, "name" | "imageKey" | "isVerified">;
    className?: string;
    verifiedSize?: string;
    size?: number;
    priority?: boolean;
};

export function Avatar({
    profile,
    className,
    verifiedSize = "size-9",
    size = 90,
    priority = false,
}: AvatarProps): React.JSX.Element {
    const [failed, setFailed] = useState(false);
    const src = failed ? null : avatarUrl(profile.imageKey);
    const alt = `${profile.name}'s profile picture`;
    const classList = cn(
        "pointer-events-none aspect-square rounded-full object-cover select-none",
        className
    );

    return (
        <div className="ring-foreground/15 relative aspect-square rounded-full ring-1">
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    // Fixed-size image: without `sizes`, next/image emits a 1x/2x srcset instead of all 16 widths
                    width={size}
                    height={size}
                    priority={priority}
                    draggable={false}
                    className={classList}
                    onError={() => setFailed(true)}
                />
            ) : (
                // Only build the generated avatar when it's actually shown
                // eslint-disable-next-line @next/next/no-img-element -- inline data URI, nothing to optimise
                <img
                    src={createAvatar(personas, { seed: profile.name || "user", size }).toDataUri()}
                    alt={alt}
                    width={size}
                    height={size}
                    draggable={false}
                    className={classList}
                />
            )}
            {profile.isVerified && (
                <Image
                    src={verifiedIcon}
                    alt="Verified"
                    className={cn("absolute right-0 bottom-0", verifiedSize)}
                />
            )}
        </div>
    );
}
