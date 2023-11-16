import React from "react";

import { ModalRoot } from "./download-instructions.styles";
import { SuccessIcon } from "@/assets/success.icon";

export const DownloadInstructions = () => (
    <ModalRoot>
        <SuccessIcon />
        <div>
            {" Saved! \n Share on your favourite social network"}
        </div>
    </ModalRoot>
);
