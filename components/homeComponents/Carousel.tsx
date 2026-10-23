"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AliceCarousel, { type Responsive } from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import { ProfileCard } from "@/components/ProfileCard";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/components/usePrefersReducedMotion";
import type { PublicProfile } from "@/lib/profiles/types";

const RESPONSIVE: Responsive = {
    0: { items: 1 },
    600: { items: 2 },
    1000: { items: 3, itemsFit: "contain" },
};

const arrowClass = "absolute top-1/2 z-10 -translate-y-1/2 rounded-full shadow-md";

export function ProfileCarousel({ profiles }: { profiles: PublicProfile[] }): React.JSX.Element {
    const carousel = useRef<AliceCarousel>(null);
    const reducedMotion = usePrefersReducedMotion();

    return (
        <div className="relative px-10 sm:px-12">
            <AliceCarousel
                ref={carousel}
                responsive={RESPONSIVE}
                mouseTracking
                infinite
                animationDuration={reducedMotion ? 0 : 400}
                autoPlayControls={false}
                disableDotsControls
                disableButtonsControls
                items={profiles.map((profile, index) => (
                    <div key={profile.ringId} className="mx-3 flex min-h-[35rem] flex-col">
                        {/* Only the first visible cards compete for bandwidth */}
                        <ProfileCard profile={profile} priority={index < 3} />
                    </div>
                ))}
            />
            {profiles.length > 1 && (
                <>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={`${arrowClass} left-0`}
                        onClick={(event) => carousel.current?.slidePrev(event)}
                        aria-label="Previous members"
                    >
                        <ChevronLeft aria-hidden />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={`${arrowClass} right-0`}
                        onClick={(event) => carousel.current?.slideNext(event)}
                        aria-label="Next members"
                    >
                        <ChevronRight aria-hidden />
                    </Button>
                </>
            )}
        </div>
    );
}
