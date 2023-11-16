import React from "react";
import { ScanYourBodyIcon } from "./icons/scan-your-body.icon";
import { InstructionContainer, InstructionDescription } from "./instructions.styles";
import { type InstructionsProps } from "./main-instructions.component";
import observer from "@/store/observer.component";

export const BodyInstructions = observer(function BodyInstructionsComponent ({ isDetected, isCameraAccessAllowed, isMobile }: InstructionsProps & { isCameraAccessAllowed: boolean, isMobile: boolean }) {
    const message = isMobile ? "Find a mirror so your whole body is shown on screen" : "Stand back 4-6 feet, so your whole body is shown on the screen";
    if (!isCameraAccessAllowed || isDetected) {
        return <></>;
    }
    return <InstructionContainer>
        <ScanYourBodyIcon />
        <InstructionDescription>{message}</InstructionDescription>
    </InstructionContainer>;
}, ["isCameraAccessAllowed", "isMobile"]);
