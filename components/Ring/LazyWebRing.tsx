"use client";

import dynamic from "next/dynamic";
import type { SafeUserType } from "@/utils/zod";

const WebRing = dynamic(() => import("./WebRing").then((mod) => mod.WebRing), {
    ssr: false,
    loading: () => (
        <div className="flex h-[max(12rem,calc(100svh-36rem))] w-full items-center justify-center">
            <p className="text-muted-foreground">Loading 3D scene...</p>
        </div>
    ),
});

export function LazyWebRing({ data }: { data: SafeUserType[] }) {
    return <WebRing data={data} />;
}
