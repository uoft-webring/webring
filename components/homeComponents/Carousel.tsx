"use client";

import AliceCarousel, { type Responsive } from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import { ProfileCard } from "@/components/ProfileCard";
import type { PublicProfile } from "@/lib/profiles/types";

const RESPONSIVE: Responsive = {
    0: { items: 1 },
    600: { items: 2 },
    1000: { items: 3, itemsFit: "contain" },
};

export function ProfileCarousel({ profiles }: { profiles: PublicProfile[] }): React.JSX.Element {
    return (
        <AliceCarousel
            responsive={RESPONSIVE}
            mouseTracking
            infinite
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
    );
}
