"use client";
import loadingAnimation from "@/assets/loading-animation.json";

// Importing Lottie, importing directly makes Lottie
// think SSR is being used which causes errors
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

//TODO: fix CSS styling, currently unable to see h2 tag because of foreground colours
export default function Loading() {
    return (
        <div className="w-72">
            <Lottie animationData={loadingAnimation} loop={true} />
        </div>
        // <div className="h-screen w-screen flex items-center justify-center">
        //     <div className="relative">
        //     </div>
        // </div>
    );
}
