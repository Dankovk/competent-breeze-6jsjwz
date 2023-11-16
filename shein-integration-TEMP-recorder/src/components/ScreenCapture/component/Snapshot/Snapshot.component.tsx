import React, { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import CameraPhoto from "@/assets/CameraPhoto";

import { useDomReady } from "@/components/ScreenCapture/hook/useDomReady";
import { CameraIconWrapper, CountdownContainer, CountdownText } from "@/components/ScreenCapture/styles";
import { Preview } from "@/components/ScreenCapture/component/Preview/Preview.component";

import { RootSnapshot } from "./styles";
import { store } from "@/store/store";
import { useDelay } from "@/components/ScreenCapture/hook/useDelay";
import { type LottieConfig, useLottie } from "@/components/ScreenCapture/hook/useLottie";

interface Props {
    isActive?: boolean
    onClick?: () => boolean
    onSnapshot: () => void
    delay?: number
    onCancel: () => void
    previewPortalId?: string
}

export const Snapshot: React.FC<Props> = ({
    isActive = false,
    onClick = () => true,
    onSnapshot = () => {},
    onCancel = () => {},
    previewPortalId,
    delay = 0
}) => {
    const [snapshotTaken, setSnapshotTaken] = useState(false);
    const [recordingStartTimeout, setRecordingStartTimeout] = useState<NodeJS.Timeout | null>(null);
    const countDownContainer = useRef<HTMLDivElement>(null);
    const snapshotPreviewRef = useRef();
    const domReady = useDomReady();
    const container = useMemo(() => {
        if (domReady && previewPortalId) {
            return store.documentRef?.getElementById(previewPortalId ?? "");
        }
        return null;
    }, [domReady, previewPortalId]);

    const animationConfig: Record<string, LottieConfig> | null = useMemo(() => {
        if (container != null) {
            return {
                countdownAnimation: {
                    containerRef: countDownContainer,
                    path: "./lottie/count-down.json",
                    loop: true
                }
            };
        }
        return null;
    }, [container]);

    const handleDelayEnd = async () => {
        await takeSnapshot();
        countdownAnimation.stop();
    };

    const { countdownAnimation } = useLottie(animationConfig);
    const { isDelaying, startDelay, clearDelay } = useDelay(delay, handleDelayEnd);

    const takeSnapshot = async () => {
        if (store.snapshoter == null) {
            throw new Error("Snapshoter not initialized");
        }

        const image = await store.snapshoter.snapshot();

        if (image === null) {
            throw new Error("Snapshoter failed to take snapshot");
        }

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (context == null) {
            throw new Error("Failed to get canvas context");
        }

        canvas.width = image.width;
        canvas.height = image.height;
        context.putImageData(image, 0, 0);
        const snapshotImg = canvas.toDataURL();
        const preview: any = snapshotPreviewRef.current;
        preview.src = snapshotImg;

        setSnapshotTaken(true);
        setRecordingStartTimeout(null);
        onSnapshot();
        clearDelay(recordingStartTimeout);
    };

    const onClickHandler = async () => {
        const payload = onClick();

        try {
            if (!payload) {
                return;
            }
            if (!delay) {
                await takeSnapshot();

                return;
            }

            if (!isDelaying) {
                if (!store.isRear) {
                    countdownAnimation.play();
                }

                const timeout = startDelay();
                setRecordingStartTimeout(timeout);
            } else {
                clearDelay(recordingStartTimeout);
                setRecordingStartTimeout(null);

                countdownAnimation.stop();
            }
        } catch (e) {
            console.error(`Create snapshot error: ${e?.toString()}`);
            store.isError = true;
        }
    };

    const onSnapshotClose = useCallback(() => {
        setSnapshotTaken(false);
        onCancel();
    }, []);

    if (!domReady) {
        return <></>;
    }
    return (
        <RootSnapshot>
            <div>
                <CameraIconWrapper active={isActive} onClick={onClickHandler} style={{ marginLeft: -1 }}>
                    <CameraPhoto/>
                </CameraIconWrapper>
            </div>
            { createPortal(
                <>
                    <CountdownContainer ref={countDownContainer} style={{ width: "330px", height: "auto" }}>
                        <CountdownText isVisible={!(recordingStartTimeout == null)}>{store.countDownMessage}</CountdownText>
                    </CountdownContainer>
                    <Preview
                        snapShotPreviewImgRef={snapshotPreviewRef}
                        snapShotTaken={snapshotTaken}
                        onSnapshotClose={onSnapshotClose}
                    />
                </>,
                store.documentRef?.getElementById(previewPortalId)
            )
            }
        </RootSnapshot>
    );
};
