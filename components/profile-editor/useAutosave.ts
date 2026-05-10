"use client";

import { useEffect, useRef } from "react";

/**
 * Debounced, serialised saving. Only one save runs at a time and only the newest value is sent
 * next, so a slow request can never land after (and overwrite) a newer edit.
 */
export function useAutosave<T>(
    save: (value: T) => Promise<void>,
    delayMs: number
): { schedule: (value: T) => void; flush: () => Promise<void> } {
    const saveRef = useRef(save);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const queued = useRef<{ value: T } | null>(null);
    const running = useRef<Promise<void> | null>(null);

    useEffect(() => {
        saveRef.current = save;
    });

    const drain = async (): Promise<void> => {
        if (running.current) return running.current;
        running.current = (async () => {
            while (queued.current) {
                const { value } = queued.current;
                queued.current = null;
                await saveRef.current(value).catch(() => {});
            }
        })();
        await running.current;
        running.current = null;
    };

    const clearTimer = () => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
    };

    useEffect(() => {
        // Warn before leaving with an edit that hasn't been sent yet
        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            if (queued.current || running.current) event.preventDefault();
        };
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", onBeforeUnload);
            clearTimer();
            // Client-side navigation (e.g. "Continue") unmounts without beforeunload: send what's pending.
            // Server actions keep running after unmount.
            if (queued.current) void drain();
        };
    }, []);

    return {
        schedule(value) {
            queued.current = { value };
            clearTimer();
            timer.current = setTimeout(() => void drain(), delayMs);
        },
        async flush() {
            clearTimer();
            await drain();
            // A save may have been queued while the previous one was running
            if (queued.current) await drain();
        },
    };
}
