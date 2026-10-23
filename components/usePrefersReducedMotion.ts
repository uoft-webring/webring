"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
    const query = window.matchMedia(REDUCED_MOTION);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

/** Live `prefers-reduced-motion`; false during SSR. */
export function usePrefersReducedMotion(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(REDUCED_MOTION).matches,
        () => false
    );
}
