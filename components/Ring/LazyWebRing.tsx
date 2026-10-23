"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";
import type { PublicProfile } from "@/lib/profiles/types";
import { usePrefersReducedMotion } from "../usePrefersReducedMotion";

const WebRing = dynamic(() => import("./WebRing").then((mod) => mod.WebRing), {
    ssr: false,
    loading: () => (
        <div className="flex h-[max(12rem,calc(100svh-36rem))] w-full items-center justify-center">
            <p className="text-muted-foreground">Loading 3D scene...</p>
        </div>
    ),
});

function supportsWebGL(): boolean {
    try {
        const canvas = document.createElement("canvas");
        return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
        return false;
    }
}

type Failure = "webgl" | "load" | null;

class WebGLErrorBoundary extends Component<{ children: ReactNode }, { failure: Failure }> {
    state: { failure: Failure } = { failure: null };

    // Any error lands here, including a scene chunk that failed to download on a flaky network
    static getDerivedStateFromError(): { failure: Failure } {
        return { failure: supportsWebGL() ? "load" : "webgl" };
    }

    render() {
        if (this.state.failure) {
            return (
                <div className="flex h-[max(12rem,calc(100svh-36rem))] w-full items-center justify-center">
                    <p className="text-muted-foreground">
                        {this.state.failure === "webgl"
                            ? "3D scene unavailable — WebGL is not supported in this browser."
                            : "3D scene unavailable — it couldn't load. Refresh the page to try again."}
                    </p>
                </div>
            );
        }
        return this.props.children;
    }
}

export function LazyWebRing({ members }: { members: PublicProfile[] }): React.JSX.Element {
    const reducedMotion = usePrefersReducedMotion();

    return (
        <WebGLErrorBoundary>
            <WebRing members={members} still={reducedMotion} />
        </WebGLErrorBoundary>
    );
}
