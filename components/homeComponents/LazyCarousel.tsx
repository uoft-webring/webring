"use client";

import dynamic from "next/dynamic";
import type { SafeUserType } from "@/utils/zod";

const ProfileCarousel = dynamic(() => import("./Carousel"), { ssr: false });

export default function LazyCarousel({ data }: { data: SafeUserType[] }) {
    return <ProfileCarousel data={data} />;
}
