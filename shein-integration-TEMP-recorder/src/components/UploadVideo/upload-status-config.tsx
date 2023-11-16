import React from "react";
import { FileSizeExceededIcon } from "../../assets/file-size-error.icon";
import { ErrorIcon } from "../../assets/error.icon";
import { SelfieIcon } from "../../assets/selfie.icon";
import {
    BUTTON_TRY_AGAIN,
    BUTTON_UPLOAD_MEDIA,
    DETECT_ERROR_DESCRIPTION, DETECT_ERROR_TITLE,
    SIZE_ERROR_DESCRIPTION, SIZE_ERROR_TITLE, LOADING_TITLE, UPLOAD_DESCRIPTION, UPLOAD_TITLE, WRONG_FILE_TYPE_TITLE, WRONG_FILE_TYPE_DESCRIPTION
} from "../../constants";
import { LoadingVideoIcon } from "../../assets/loading-video.icon";
import { UploadIcon } from "../../assets/upload.icon";
import { ReloadIcon } from "../../assets/reload.icon";

export interface StatusConfigType {
    title?: string
    description?: string
    buttonText?: string
    buttonIcon?: React.ReactNode
    icon?: React.ReactNode
}

type UploadStatusConfigType = Record<"upload" | "loading" | "sizeError" | "detectError" | "success" | "wrongFormat", StatusConfigType>;
export type UploadStatusConfigKey = keyof UploadStatusConfigType;
export const uploadStatusConfig: UploadStatusConfigType = {
    upload: {
        title: UPLOAD_TITLE,
        description: UPLOAD_DESCRIPTION,
        buttonText: BUTTON_UPLOAD_MEDIA,
        buttonIcon: <UploadIcon />,
        icon: <SelfieIcon />
    },
    loading: {
        title: LOADING_TITLE,
        icon: <LoadingVideoIcon />
    },
    sizeError: {
        title: SIZE_ERROR_TITLE,
        description: SIZE_ERROR_DESCRIPTION,
        buttonText: BUTTON_TRY_AGAIN,
        buttonIcon: <ReloadIcon />,
        icon: <FileSizeExceededIcon />
    },
    detectError: {
        title: DETECT_ERROR_TITLE,
        description: DETECT_ERROR_DESCRIPTION,
        buttonText: BUTTON_TRY_AGAIN,
        buttonIcon: <ReloadIcon />,
        icon: <ErrorIcon />
    },
    wrongFormat: {
        title: WRONG_FILE_TYPE_TITLE,
        description: WRONG_FILE_TYPE_DESCRIPTION,
        buttonText: BUTTON_TRY_AGAIN,
        buttonIcon: <ReloadIcon />,
        icon: <ErrorIcon color={"#FF5E7B"}/>
    },
    success: {}
};
