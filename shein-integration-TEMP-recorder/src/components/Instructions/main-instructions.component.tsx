import React, { useEffect, useState } from "react";
import throttle from "lodash.throttle";
import { store } from "@/store/store";
import observer from "@/store/observer.component";

export interface InstructionsProps {
    isDetected: boolean
};
export const Instructions = observer(function InstructionsComponent ({ InstructionComponent, isCameraAccessAllowed, isRecording }: { InstructionComponent: React.ComponentType<InstructionsProps>, isCameraAccessAllowed: boolean, isRecording: boolean }) {
    const [detected, setDetected] = useState(false);

    const toggleDetection = throttle((isDetected: boolean) => {
        setDetected(isDetected);
    }, 400);
    useEffect(() => {
        store.emitter?.on(store.detectedMessageName, () => {
            toggleDetection(true);
        });
        store.emitter?.on(store.notDetectedMessageName, () => {
            toggleDetection(false);
        });
    }, [isCameraAccessAllowed]);
    return <div style={{ display: isRecording ? "none" : "block", pointerEvents: "none" }}>
        <InstructionComponent isDetected={detected} />
    </div>;
}, ["InstructionComponent", "isCameraAccessAllowed", "isRecording"]);
