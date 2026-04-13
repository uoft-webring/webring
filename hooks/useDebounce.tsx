"use client";

import { useRef, useEffect, useCallback } from "react";

const useDebounce = <T extends (...args: any[]) => void>(callback: T, wait: number) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef<T>(callback);

    // Always keep the ref pointing to the latest callback
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const debouncedFunc = useCallback(
        (...args: Parameters<T>) => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, wait);
        },
        [wait]
    );

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return debouncedFunc;
};

export default useDebounce;
