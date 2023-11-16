import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScanYourFaceIcon } from "./icons/scan-your-face.icon";
import { InstructionContainer, InstructionDescription } from "./instructions.styles";
import { type InstructionsProps } from "./main-instructions.component";
import observer from "@/store/observer.component";
import { DesktopDragInstruction, MobileDragInstructions } from "./icons/drag-instruction.icon";
import { type SKUKeys } from "@/utils/skuHelper";
import { skuTypeMap } from "@/utils/skuHelper";

let timeoutStop: NodeJS.Timeout | null = null;
let timeoutStart: NodeJS.Timeout | null = null;

export const DragInstructions = observer(function DragInstructionsComponent ({
    isDetected, isCameraAccessAllowed, isConcentStepFinished,
    currentModelId
}: { isCameraAccessAllowed: boolean
    isConcentStepFinished: boolean
    currentModelId: SKUKeys
} & InstructionsProps) {
    const [isDragInstructionShown, setIsDragInstructionShown] = useState(false);
    const isDragInstructionsWasShown = useRef(false);
    const [isPortrait, setIsPortrait] = useState(window.matchMedia("(orientation: portrait)").matches);
    useEffect(() => {
        const resizeHandler = () => {
            setIsPortrait(window.matchMedia("(orientation: portrait)").matches);
        };
        window.addEventListener("resize", resizeHandler);
        return () => {
            window.removeEventListener("resize", resizeHandler);
        };
    }, []);
    const clearTimeouts = () => {
        (timeoutStop != null) && clearTimeout(timeoutStop);
        (timeoutStart != null) && clearTimeout(timeoutStart);
    };

    useEffect(() => {
        if (isConcentStepFinished && isDetected && !isDragInstructionsWasShown.current) {
            timeoutStart = setTimeout(() => {
                if (isDetected) {
                    setIsDragInstructionShown(true);
                }
            }, 2000);
            timeoutStop = setTimeout(() => {
                isDragInstructionsWasShown.current = true;
                setIsDragInstructionShown(false);
            }, 9000);
        } else {
            if (!isDetected) {
                clearTimeouts();
                setIsDragInstructionShown(false);
            }
        }
    }, [isConcentStepFinished, isDetected]);

    const DRAG_INSTRUCTION_COPY = useMemo(() => {
        if (skuTypeMap[currentModelId] === "earrings") {
            return "Press & Hold the earring to properly position it";
        } else if (skuTypeMap[currentModelId] === "hairclips") {
            return "Press & Hold the hair clips to properly position it";
        }
    }, [currentModelId]);
    if (isDragInstructionShown) {
        return <InstructionContainer>
            {isPortrait ? <MobileDragInstructions /> : <DesktopDragInstruction/>}
            <InstructionDescription>{DRAG_INSTRUCTION_COPY}</InstructionDescription>

        </InstructionContainer>;
    }

    if (!isCameraAccessAllowed || isDetected) {
        return <></>;
    }
    return <InstructionContainer>
        <ScanYourFaceIcon />
        <InstructionDescription>Scan your face to try-on</InstructionDescription>
    </InstructionContainer>;
}, ["isCameraAccessAllowed", "isConcentStepFinished", "currentModelId"]);
