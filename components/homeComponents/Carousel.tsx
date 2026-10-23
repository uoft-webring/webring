"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
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

// 44px round buttons on a blurred card surface: visible against both the cards and the page
const arrowClass =
    "bg-card/80 hover:bg-card absolute top-1/2 z-10 size-11 -translate-y-1/2 rounded-full shadow-lg backdrop-blur [&_svg:not([class*='size-'])]:size-5";

export function ProfileCarousel({ profiles }: { profiles: PublicProfile[] }): React.JSX.Element {
    const carousel = useRef<AliceCarousel>(null);
    const reducedMotion = usePrefersReducedMotion();

    return (
        <div className="relative px-12 sm:px-14">
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
                    <div key={profile.ringId} className="mx-3 flex min-h-[28rem] flex-col">
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
                        <ArrowLeft aria-hidden />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={`${arrowClass} right-0`}
                        onClick={(event) => carousel.current?.slideNext(event)}
                        aria-label="Next members"
                    >
                        <ArrowRight aria-hidden />
                    </Button>
                </>
            )}
        </div>
    );
}
