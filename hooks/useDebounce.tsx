import { useRef, useEffect, useCallback } from "react";

const useDebounce = <T extends (...args: any[]) => void>(
    callback: T,
    wait: number
) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedFunc = useCallback(
        (...args: Parameters<T>) => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                callback(...args);
            }, wait);
        },
        [callback, wait]
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
