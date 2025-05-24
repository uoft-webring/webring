import { useRef, useCallback } from "react";

function useInputFocus() {
    const focusRef = useRef<HTMLInputElement | null>(null);

    const setFocus = useCallback(() => {
        focusRef.current?.focus();
    }, []);

    return { focusRef, setFocus };
}

export default useInputFocus;
