"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";
import type { SafeUserType } from "@/utils/zod";

const WebRing = dynamic(() => import("./WebRing").then((mod) => mod.WebRing), {
    ssr: false,
    loading: () => (
        <div className="flex h-[max(12rem,calc(100svh-36rem))] w-full items-center justify-center">
            <p className="text-muted-foreground">Loading 3D scene...</p>
        </div>
    ),
});

class WebGLErrorBoundary extends Component<
    { children: ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-[max(12rem,calc(100svh-36rem))] w-full items-center justify-center">
                    <p className="text-muted-foreground">
                        3D scene unavailable — WebGL is not supported in this browser.
                    </p>
                </div>
            );
        }
        return this.props.children;
    }
}

export function LazyWebRing({ data }: { data: SafeUserType[] }) {
    return (
        <WebGLErrorBoundary>
            <WebRing data={data} />
        </WebGLErrorBoundary>
    );
}
