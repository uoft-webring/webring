"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Thumbnail of a member's site, built from the preview image the site declares (og:image).
 * Renders nothing when the site has none, so cards look the same as before for those members.
 */
export function SitePreview({
    ringId,
    domain,
    className,
}: {
    ringId: number;
    domain: string;
    className?: string;
}): React.JSX.Element | null {
    const [failed, setFailed] = useState(false);
    if (failed) return null;

    return (
        <a href={domain} target="_blank" rel="noopener noreferrer" className={cn("block overflow-hidden rounded-xl border", className)}>
            {/* eslint-disable-next-line @next/next/no-img-element -- already a sized WebP from /api/preview */}
            <img
                src={`/api/preview/${ringId}`}
                alt=""
                width={640}
                height={336}
                loading="lazy"
                decoding="async"
                className="aspect-[640/336] h-auto w-full object-cover"
                onError={() => setFailed(true)}
                // A 404 can land before hydration attaches onError; catch that case on mount
                ref={(image) => {
                    if (image?.complete && image.naturalWidth === 0) setFailed(true);
                }}
            />
        </a>
    );
}
