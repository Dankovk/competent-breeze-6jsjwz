import React from "react";
import ChevronLeftIcon from "../../assets/chevron-left.svg";
import { BackButton } from "./back-button.styles";

interface Props {
    onClick: () => void
}
export const BackButtonComponent = ({ onClick }: Props) => {
    return <BackButton
        id={"upload-video-back-button"}
        onClick={onClick}
    >
        <ChevronLeftIcon />
    </BackButton>;
};
