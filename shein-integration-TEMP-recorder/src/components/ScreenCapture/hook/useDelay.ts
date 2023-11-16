import { useState, useCallback } from "react";

// Custom hook to handle delays
export const useDelay = (delay: number, onDelayEnd?: () => void) => {
    const [isDelaying, setIsDelaying] = useState(false);

    const startDelay = useCallback(() => {
        setIsDelaying(true);
        const timeoutId = setTimeout(() => {
            setIsDelaying(false);
            onDelayEnd?.();
        }, delay);
        return timeoutId; // Return timeoutId to allow for clearing if needed
    }, [delay, onDelayEnd]);

    const clearDelay = useCallback((timeoutId: NodeJS.Timeout) => {
        clearTimeout(timeoutId);
        setIsDelaying(false);
    }, []);

    return {
        isDelaying,
        startDelay,
        clearDelay
    };
};
