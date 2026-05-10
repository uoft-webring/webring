"use client";

import dynamic from "next/dynamic";
import type { PublicProfile } from "@/lib/profiles/types";

// The carousel measures the window, so it can't render on the server
const ProfileCarousel = dynamic(() => import("./Carousel").then((mod) => mod.ProfileCarousel), {
    ssr: false,
    loading: () => <div className="min-h-[35rem]" aria-hidden />,
});

export function LazyCarousel({ profiles }: { profiles: PublicProfile[] }): React.JSX.Element {
    return <ProfileCarousel profiles={profiles} />;
}
