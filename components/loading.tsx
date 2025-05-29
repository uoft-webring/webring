"use client";

// import loadingAnimation from "@/assets/loading-animation.json";
import loader from "@/assets/loading-animation.svg"; //TODO: Fix
import Image from "next/image";
// Importing Lottie, importing directly makes Lottie
// think SSR is being used which causes errors
// import dynamic from "next/dynamic";
// const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
// import Lottie from "lottie-react";

//TODO: fix CSS styling, currently unable to see h2 tag because of foreground colours
export default function Loading() {
    // return <Lottie animationData={loadingAnimation} loop autoPlay />;
    // return <object data={loader} type="image/svg" className="h-24" />;
    return <Image src={loader} alt="Loading" />;
    // const defaultOptions = {
    //     animationData: loadingAnimation,
    //     loop: true,
    // };

    // const { View } = useLottie(defaultOptions);

    // return View;
}
