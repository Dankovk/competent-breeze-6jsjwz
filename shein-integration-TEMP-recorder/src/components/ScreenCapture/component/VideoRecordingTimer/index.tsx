import React, { useEffect, useRef } from "react";

import { TimerText } from "../../styles";

interface Props {
    isVideoRecordStarted: boolean
}

export const VideoRecordingTimer = ({ isVideoRecordStarted }: Props) => {
    const textRef = useRef();
    useEffect(() => {
        if (isVideoRecordStarted && textRef.current) {
            const startDate = new Date();
            const interval = setInterval(() => {
                // @ts-ignore
                const diff = (new Date() - startDate);
                const abs = Math.abs(diff);
                let seconds: number | string = Math.floor((abs / 1000) % 60);
                seconds = seconds > 9 ? seconds : `0${seconds}`;

                let milliseconds: number | string = Math.floor((abs / 10) % 100);
                milliseconds = milliseconds > 9 ? milliseconds : `0${milliseconds}`;
                if (textRef.current) {
                    // @ts-ignore
                    textRef.current.textContent = `${diff < 0 ? "-" : ""}${seconds}:${milliseconds}`;
                }
            }, 10);
            return () => { clearInterval(interval); };
        }
    }, [isVideoRecordStarted, textRef.current]);

    return <TimerText ref={ textRef } visible={ isVideoRecordStarted } />;
};
