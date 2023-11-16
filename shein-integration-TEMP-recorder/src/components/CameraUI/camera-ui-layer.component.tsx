import React from "react";
import { SwitchCameraButton } from "./camera-ui-layer.styles";
import { ScreenCapture } from "../ScreenCapture/ScreenCapture.component";
import { Record } from "../ScreenCapture/component/Record/Record.component";
import { Snapshot } from "../ScreenCapture/component/Snapshot/Snapshot.component";
import { ToggleAnimWrapper } from "@/components/ScreenCapture/styles";

import { store } from "../../store/store";
import { ArAssetsSwitcher } from "../ArAssetsSwitcher/ar-assets-switcher.component";
import observer from "@/store/observer.component";
import { CircleLoader } from "../Loader/CircleLoader";
import { ReloadIcon } from "@/assets/reload.icon";
import { EVENTS } from "@/constants";
import { getLoadingTime } from "@/utils/log";

let startedAt = 0;
let finishedAt = 0;

export const CameraUiLayer = observer(({
    isCameraAccessAllowed, isSDKStarted,
    isAds, isMobile, log, isRear,
    delay = 0
}: { isVideoMode: boolean
    isCameraAccessAllowed: boolean
    isSDKStarted: boolean
    isAds: boolean
    isMobile: boolean
    log: (message: string, sendingToParentData?: unknown) => void
    isRear: boolean
    delay: number
}) => {
    return <>
        { isSDKStarted &&
            <>
                { !(store.switchOptions.length === 0) && <ArAssetsSwitcher /> }
                <ScreenCapture
                    isAdsMode={!!isAds}
                    loader={ <CircleLoader />}
                    onClick={() => {
                        store.isRecording = true;
                    }}
                >
                    <ToggleAnimWrapper />
                    <Snapshot
                        delay={delay * (+!isRear)}
                        onCancel={() => {
                            store.isRecording = false;
                        }}
                        onSnapshot={() => {
                            log(EVENTS.SNAPSHOT, { eventName: EVENTS.SNAPSHOT });
                        }} />
                    <Record
                        delay={delay * (+!isRear)}
                        onClose={() => {
                            store.isRecording = false;
                        }}
                        onRecordStart={() => {
                            // We have a 3 seconds timer before the recording starts
                            startedAt = performance.now() + 3000;
                            log(EVENTS.RECORDING_STARTED, { eventName: EVENTS.RECORDING_STARTED, eventData: { startedAt } });
                        }}
                        onRecordStop={() => {
                            finishedAt = performance.now();
                            log(EVENTS.RECORDING_FINISHED, { eventName: EVENTS.RECORDING_FINISHED, eventData: { finishedAt, recordingTime: getLoadingTime(startedAt, finishedAt) } });
                        }}
                    />
                </ScreenCapture>
            </>
        }
        {!isAds && isCameraAccessAllowed && isMobile && <SwitchCameraButton
            id={"switch-camera-button"}
            onClick={() => {
                store.emitter?.emit("camera-switch");
            }}>
            <ReloadIcon color={"#222"} width={20} height={20}/>
        </SwitchCameraButton>}
    </>;
}, ["isCameraAccessAllowed", "isSDKStarted", "isAds", "isMobile", "log", "isRear"]);
