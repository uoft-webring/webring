"use client";

import ProfileCard from "@/components/ProfileCard";
import { SafeUserType } from "@/utils/zod";
import React from "react";
import AliceCarousel, { Responsive } from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";

export default function ProfileCarousel({
    data: ringProfiles,
}: {
    data: SafeUserType[];
}) {
    const responsive: Responsive = {
        0: {
            items: 1,
        },
        600: {
            items: 2,
        },
        1000: {
            items: 3,
            itemsFit: "contain",
        },
    };

    return (
        <AliceCarousel
            responsive={responsive}
            mouseTracking
            infinite={true}
            autoPlayControls={false}
            disableDotsControls={true}
            disableButtonsControls={true}
            items={ringProfiles.map((profile, index) => {
                return (
                    <div className="mx-3">
                        <ProfileCard
                            key={index}
                            user={profile}
                            className="ml-0"
                        />
                    </div>
                );
            })}
        ></AliceCarousel>
    );
}
