"use client";

import React from "react";
import dynamic from "next/dynamic";

const Loading = dynamic(() => import("@/components/loadingComponent"), {
    ssr: false,
});

export default async function LoadingPage() {
    return (
        <div className="flex items-center justify-center">
            <Loading />
            This is from the loading page
        </div>
    );
}
