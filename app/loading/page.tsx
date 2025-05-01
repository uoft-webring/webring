'use client';
import loadingAnimation from '../assets/loading-animation.json';

// Importing Lottie, importing directly makes Lottie
// think SSR is being used which causes errors
import dynamic from 'next/dynamic';
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function Loading() {
    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="relative">
                <Lottie animationData={loadingAnimation} loop={true} />
                <h2 className="absolute bottom-[30%] left-[50%] translate-x-[-50%] text-4xl text-white">
                    LOADING
                </h2>
            </div>
        </div>
    );
}
