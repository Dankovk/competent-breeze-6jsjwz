import React from "react";
import { ScanYourFaceIcon } from "./icons/scan-your-face.icon";
import { InstructionContainer, InstructionDescription } from "./instructions.styles";
import { type InstructionsProps } from "./main-instructions.component";
import observer from "@/store/observer.component";

export const FaceInstructions = observer(function FaceInstructionsComponent ({ isDetected, isCameraAccessAllowed }: InstructionsProps & { isCameraAccessAllowed: boolean }) {
    if (!isCameraAccessAllowed || isDetected) {
        return <></>;
    }
    return <InstructionContainer>
        <ScanYourFaceIcon />
        <InstructionDescription>Scan your face to try-on</InstructionDescription>
    </InstructionContainer>;
}, ["isCameraAccessAllowed"]);
