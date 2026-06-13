import { useRef, useEffect, useCallback } from "react";

/**
 * Hook to track if component is currently mounted
 * Prevents accessing unmounted widgets or updating unmounted components
 */
export function useIsMounted() {
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    return useCallback(() => isMounted.current, []);
}
