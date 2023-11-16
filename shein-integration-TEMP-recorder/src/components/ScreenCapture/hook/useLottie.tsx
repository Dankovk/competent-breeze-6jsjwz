import type React from "react";
import { useEffect, useState } from "react";

export interface LottieConfig {
    path: string
    containerRef?: React.RefObject<HTMLElement | undefined>
    renderer?: "svg" | "canvas" | "html"
    loop?: boolean
    autoplay?: boolean
}

export type LottieAnimations<T extends Record<string, LottieConfig>> = T;

export const useLottie = <T extends Record<string, LottieConfig>>(animations: T | null): { [K in keyof T]: any } => {
    const [a, setAnimations] = useState<{ [K in keyof T]: any }>({});

    useEffect(() => {
        const loadAnimations = async () => {
            const newAnimations: { [K in keyof T]: any } = {} as any;
            if (animations == null) {
                return;
            }
            for (const key in animations) {
                const { loop = false, autoplay = false, path, containerRef, renderer = "svg" } = animations[key];

                newAnimations[key] = await lottie.loadAnimation({
                    container: containerRef?.current,
                    renderer,
                    loop,
                    autoplay,
                    path
                });
            }

            setAnimations(newAnimations);
        };
        if (animations != null) {
            loadAnimations();
        }
    }, [animations]);

    return a;
};
