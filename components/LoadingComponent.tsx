"use client";

import loadingAnimation from "@/assets/loading-animation.json";
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function Loading() {
    return <Lottie animationData={loadingAnimation} loop autoPlay />;
}
