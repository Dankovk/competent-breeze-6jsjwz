import React, { useEffect, useRef, useState } from "react";
import { BagInstructionIcon } from "./icons/bag-instruction.icon";
import { InstructionContainer, InstructionDescription } from "./instructions.styles";
import { type InstructionsProps } from "./main-instructions.component";
import observer from "@/store/observer.component";
import { type SKUKeys } from "@/utils/skuHelper";
import { ScanYourBodyIcon } from "./icons/scan-your-body.icon";

let timeoutStop: NodeJS.Timeout | null = null;
let timeoutStart: NodeJS.Timeout | null = null;

export const BagInstructions = observer(function BagInstructionsComponent ({
    isDetected, isCameraAccessAllowed, isConcentStepFinished,
    isMobile
}: { isCameraAccessAllowed: boolean
    isConcentStepFinished: boolean
    currentModelId: SKUKeys
    isMobile: boolean
} & InstructionsProps) {
    const [isBagInstructionShown, setIsBagInstructionShown] = useState(false);
    const isBagInstructionsWasShown = useRef(false);
    const message = isMobile ? "Find a mirror so your whole body is shown on screen" : "Stand back 4-6 feet, so your whole body is shown on the screen";

    const clearTimeouts = () => {
        (timeoutStop != null) && clearTimeout(timeoutStop);
        (timeoutStart != null) && clearTimeout(timeoutStart);
    };

    useEffect(() => {
        if (isConcentStepFinished && isDetected && !isBagInstructionsWasShown.current) {
            timeoutStart = setTimeout(() => {
                if (isDetected) {
                    setIsBagInstructionShown(true);
                }
            }, 2000);
            timeoutStop = setTimeout(() => {
                isBagInstructionsWasShown.current = true;
                setIsBagInstructionShown(false);
            }, 6000);
        } else {
            if (!isDetected) {
                clearTimeouts();
                setIsBagInstructionShown(false);
            }
        }
    }, [isConcentStepFinished, isDetected]);

    if (isBagInstructionShown) {
        return <InstructionContainer>
            <BagInstructionIcon />
            <InstructionDescription>{"Place hand in the camera view \n to try on bag"}</InstructionDescription>
        </InstructionContainer>;
    }

    if (!isCameraAccessAllowed || isDetected) {
        return <></>;
    }
    return <InstructionContainer>
        <ScanYourBodyIcon />
        <InstructionDescription>{message}</InstructionDescription>
    </InstructionContainer>;
}, ["isCameraAccessAllowed", "isConcentStepFinished", "currentModelId", "isMobile"]);
