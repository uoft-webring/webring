"use client";

import dynamic from "next/dynamic";
import { Component, useSyncExternalStore, type ReactNode } from "react";
import type { PublicProfile } from "@/lib/profiles/types";

const WebRing = dynamic(() => import("./WebRing").then((mod) => mod.WebRing), {
    ssr: false,
    loading: () => (
        <div className="flex h-[max(12rem,calc(100svh-36rem))] w-full items-center justify-center">
            <p className="text-muted-foreground">Loading 3D scene...</p>
        </div>
    ),
});

class WebGLErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
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

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void): () => void {
    const query = window.matchMedia(REDUCED_MOTION);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

export function LazyWebRing({ members }: { members: PublicProfile[] }): React.JSX.Element {
    const reducedMotion = useSyncExternalStore(
        subscribeReducedMotion,
        () => window.matchMedia(REDUCED_MOTION).matches,
        () => false
    );

    return (
        <WebGLErrorBoundary>
            <WebRing members={members} still={reducedMotion} />
        </WebGLErrorBoundary>
    );
}
