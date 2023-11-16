import React, {
    useEffect,
    useMemo,
    useRef
} from "react";
import { AnimationLoader, AnimationWrapper } from "./upload-video.style";

export function AnimatedProgressBar ({ duration = 100, success, onSuccess }: { duration?: number, success: boolean, onSuccess?: () => void }) {
    const localValue = useRef(0);
    const interval = useRef();
    const [value, setValue] = React.useState(0);

    const finishProgress = () => {
        setValue(100);
        interval.current && clearInterval(interval.current);
        onSuccess?.();
    };
    const initInterval = () => {
    // @ts-ignore
        interval.current = setInterval(() => {
            let val: number = localValue.current || 0;
            val += Math.floor(Math.random() * 10) + 1;
            if (val >= 80) {
                clearInterval(interval.current);
            }
            setValue(val);
            localValue.current = val;
        }, duration);
    };
    useEffect(() => {
        if (success && localValue.current <= 100) {
            finishProgress();
        } else {
            initInterval();
        }
    }, [success]);

    const containerStyles = useMemo(() => ({
        width: success ? "100%" : `${value}%`,
        transitionDuration: duration ? `${duration / 1000}s` : "0.8s"
    }), [success, value]);

    return (
        <AnimationWrapper>
            <AnimationLoader style={ containerStyles } />
        </AnimationWrapper>
    );
}
