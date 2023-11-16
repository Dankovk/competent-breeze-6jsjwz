export const UPLOAD_TITLE = "Camera access denied. Want to use a video selfie instead?";
export const UPLOAD_DESCRIPTION = "Upload a video that matches the scale shown above. \n File formats: mp4, mov.";

export const LOADING_TITLE = "Magic is happening… File is loading";
export const SIZE_ERROR_TITLE = "File size exceeded";
export const SIZE_ERROR_DESCRIPTION = "We recommend to uploaded selfie media that is 3Mb or smaller. File formats: png, jpeg, mp4, mov";
export const DETECT_ERROR_TITLE = "No body was detected";
export const DETECT_ERROR_DESCRIPTION = "Your video should contain face or body in order to apply AR filter. \n Please try another media.";
export const BUTTON_UPLOAD_MEDIA = "Upload media";
export const BUTTON_TRY_AGAIN = "Try another file";

export const WRONG_FILE_TYPE_TITLE = "Ooops, wrong file format";
export const WRONG_FILE_TYPE_DESCRIPTION = "Upload a video in these file formats: mp4, mov.";

export const DETECTED_MESSAGE_NAME = "camera-detect";
export const NOT_DETECTED_MESSAGE_NAME = "camera-undetect";

export const THROTTLE_CONSTANT = 400;
export const RECORD_DELAY = 3000;
export const MESSAGES = {
    START_AR: "start-ar",
    CAMERA_ACCESS_CANCEL: "camera-access-cancel",
    IFRAME_LOADED: "iframe-loaded",
    READY_TO_LISTEN: "ready-to-listen",
    CHANGE_SKU: "change-sku",
    ERROR: "vto-error",
    EVENT: "vto-event"
} as const;

export const EVENTS = {
    INIT_SDK_STARTED: "vto-init-sdk-started",
    INIT_SDK_FINISHED: "vto-init-sdk-finished",
    START_SDK_STARTED: "vto-start-sdk-started",
    START_SDK_FINISHED: "vto-start-sdk-finished",
    STYLE_SWITCH: "vto-style-switch",
    SNAPSHOT: "vto-snapshot",
    RECORDING_STARTED: "vto-recording-started",
    RECORDING_FINISHED: "vto-recording-finished",
    VIDEO_UPLOAD: "vto-video-upload",
    FILE_DOWNLOAD: "vto-file-download",
    FILE_SHARE: "vto-file-share",
    CHANGE_SKU: "vto-change-sku",
    CAMERA_SWITCH: "vto-camera-switch"
} as const;

export const enum ERROR_CODES {
    JS,
    INIT_DOM,
    INIT_SDK,
    START_SDK,
    START_APP,
    CHANGE_SKU,
    PROBABLY_CACHE
};

export const LOGDNA_KEY = process.env.LOGDNA_KEY ?? "";
export const SENTRY_DSN = process.env.SENTRY_DSN ?? "";
export const ENV = process.env.ENV ?? "";
export const VERSION = process.env.VERSION ?? "";
