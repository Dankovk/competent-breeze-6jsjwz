import React, { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createPortal } from "react-dom";
import { Preview } from "@/components/ScreenCapture/component/Preview/Preview.component";
import {
    CameraAnimContainer,
    CameraIconWrapper,
    CameraPulseContainer,
    CountdownContainer,
    CountdownText,
    VideoRecordingIndicatorContainer
} from "@/components/ScreenCapture/styles";
import { VideoRecordingTimer } from "@/components/ScreenCapture/component/VideoRecordingTimer";
import { LoadingScreen } from "@/components/ScreenCapture/component/LoadingScreen";

import { useDomReady } from "@/components/ScreenCapture/hook/useDomReady";
import { type LottieConfig, useLottie } from "@/components/ScreenCapture/hook/useLottie";
import { useDelay } from "@/components/ScreenCapture/hook/useDelay";
import { RootRecord } from "./styles";
// @TODO: remove direct import of store
import { store } from "@/store/store";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const MAX_RECORDING_TIME = 10000;
const MIN_RECORDING_TIME = 1500;
interface Props {
    previewPortalId?: string
    loader?: ReactNode | string
    delay?: number
    onRecordClick?: () => boolean
    onClose: () => void
    onRecordStart?: () => void
    onRecordStop?: () => void
}

const processMP4File = async (blob, ffmpeg: FFmpeg) => {
    await ffmpeg.load();

    const fileName = "input.mp4";
    await ffmpeg.writeFile(fileName, await fetchFile(blob));

    const outputFileName = "output.mp4";
    await ffmpeg.exec(["-i", fileName, "-c", "copy", outputFileName]);

    const data = await ffmpeg.readFile(outputFileName);

    const processedBlob = new Blob([data], { type: "video/mp4" });

    await ffmpeg.deleteFile(fileName);
    await ffmpeg.deleteFile(outputFileName);

    return processedBlob;
};

export const Record: React.FC<Props> = ({
    previewPortalId,
    loader,
    delay = 0,
    onRecordClick = () => true,
    onRecordStart = () => {},
    onRecordStop = () => {},
    onClose = () => {}
}) => {
    const ffmpegRef = useRef(new FFmpeg());

    const load = async () => {
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd";
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on("log", ({ message }) => {
            console.log(message);
        });
        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm")
        });
        
    };

    const domReady = useDomReady();

    const [snapshotTaken, setSnapshotTaken] = useState(false);
    const [isVideoRecordStarted, setIsVideoRecordStarted] = useState(false);
    const [isVideoTimeoutReleased, setIsVideoTimeoutReleased] = useState(false);
    const [recordingStartTimeout, setRecordingStartTimeout] = useState<NodeJS.Timeout | null>(null);
    const [recordingStopTimeout, setRecordingStopTimeout] = useState<NodeJS.Timeout | null>(null);
    const stopRecordingDelayPromise = useRef<Promise<void> | null>(null);
    const [capturedBlob, setBlob] = useState<Blob | null>();
    const [isLoading, setIsLoading] = useState(false);

    const cameraContainer = useRef<HTMLDivElement>(null);
    const pulseContainer = useRef<HTMLDivElement>(null);
    const recordingIndicatorRef = useRef<HTMLDivElement>(null);
    const snapShotPreviewVideoRef = useRef<HTMLVideoElement>(null);
    const countDownContainer = useRef<HTMLDivElement>(null);

    const container = useMemo(() => {
        if (domReady && previewPortalId) {
            return store.documentRef?.getElementById(previewPortalId ?? "");
        }
        return null;
    }, [domReady, previewPortalId]);

    const animationConfig: Record<string, LottieConfig> | null = useMemo(() => {
        if (container != null) {
            return {
                cameraAnimation: {
                    containerRef: cameraContainer,
                    path: "./lottie/morph.json"
                },
                pulseAnimation: {
                    containerRef: pulseContainer,
                    path: "./lottie/record-pulse.json",
                    loop: true
                },
                recordingAnimation: {
                    containerRef: recordingIndicatorRef,
                    path: "./lottie/camera-recording-indicator.json",
                    loop: true
                },
                countdownAnimation: {
                    containerRef: countDownContainer,
                    path: "./lottie/count-down.json"
                }
            };
        }
        return null;
    }, [container]);

    const { cameraAnimation, countdownAnimation, recordingAnimation, pulseAnimation } = useLottie(animationConfig);

    const onStartVideo = () => {
        setRecordingStartTimeout(null);
        setIsVideoTimeoutReleased(true);
        if (!store.isRear) {
            pulseAnimation.play();
        } else {
            setTimeout(() => {
                pulseAnimation.play();
            }, 300);
        }
        recordingAnimation.play();
        store.recorder?.start();
        stopRecordingDelayPromise.current = new Promise<void>((resolve) => {
            setTimeout(resolve, MIN_RECORDING_TIME);
        });
    };

    const { isDelaying, startDelay, clearDelay } = useDelay(delay, onStartVideo);

    const removeInstructions = () => {
        const instructions = store.documentRef?.getElementById("instructions");
        if (instructions != null) {
            instructions.style.opacity = "0";
        }
    };

    const launchStopTimer = () => {
        const timeout = setTimeout(stopVideoRecording, MAX_RECORDING_TIME);
        setRecordingStopTimeout(timeout);
    };

    useEffect(() => {
        recordingAnimation?.setSpeed(0.5);
    }, []);

    useEffect(() => {
        if ((recordingStartTimeout == null) && isVideoRecordStarted) {
            launchStopTimer();
        }
    }, [recordingStartTimeout]);

    const startVideoRecording = async () => {
        setIsVideoRecordStarted(true);
        setSnapshotTaken(false);

        cameraAnimation?.setDirection(1);
        cameraAnimation?.play();

        removeInstructions();

        if (delay) {
            const timeout = startDelay();
            setRecordingStartTimeout(timeout);

            if (!store.isRear) {
                countdownAnimation.play();
            }
        } else {
            onStartVideo();
        }
    };

    const stopVideoRecording = async () => {
        const onEnd = (withRelease = true) => {
            setIsLoading(false);
            recordingAnimation.stop();
            countdownAnimation.stop();

            withRelease && setIsVideoTimeoutReleased(false);
            setRecordingStopTimeout(null);
            setIsVideoRecordStarted(false);
            clearDelay(recordingStopTimeout);
            setRecordingStartTimeout(null);
        };

        try {
            cameraAnimation.setDirection(-1);
            cameraAnimation.play();

            pulseAnimation.stop();

            if (isDelaying) {
                clearDelay(recordingStartTimeout);
                setRecordingStartTimeout(null);
                setIsVideoRecordStarted(false);

                countdownAnimation.stop();
            } else if (snapShotPreviewVideoRef.current != null) {
                setIsLoading(true);
                snapShotPreviewVideoRef.current.muted = false;
                const blob = await store.recorder?.stop();
                if (blob == null) {
                    throw new Error("Video parsing error");
                }

                const b = await processMP4File(blob, ffmpegRef.current);

                setBlob(b);

                snapShotPreviewVideoRef.current.src = URL.createObjectURL(blob);

                window.audio?.pause();

                await snapShotPreviewVideoRef.current?.play();

                setSnapshotTaken(true);
                window.freeze = true;
                onEnd();
            }
        } catch (e) {
            console.error(`Recording error: ${e?.toString()}`);
            onEnd();
            store.isError = true;
        }
    };

    const onVideoStarted = async () => {
        const payload = onRecordClick();
        if (payload) {
            onRecordStart();
            await startVideoRecording();
        }
    };

    const onVideoPaused = async () => {
        await stopRecordingDelayPromise.current;
        const payload = onRecordClick();
        if (payload) {
            onRecordStop();
            stopVideoRecording();
        }
    };

    const onSnapshotCloseHandler = useCallback(() => {
        setSnapshotTaken(false);
        onClose();
    }, []);

    if (container == null) {
        return null;
    }
    return (
        <RootRecord>
            <div>
                <CameraAnimContainer ref={cameraContainer}/>
                <CameraPulseContainer active={isVideoTimeoutReleased} ref={pulseContainer}/>
                <VideoRecordingIndicatorContainer visible={isVideoRecordStarted}
                    ref={recordingIndicatorRef}/>
                <CameraIconWrapper onClick={async () => { !isVideoRecordStarted ? await onVideoStarted() : onVideoPaused(); }}/>
                <VideoRecordingTimer isVideoRecordStarted={isVideoTimeoutReleased}/>
            </div>

            {isLoading
                ? createPortal(
                    <LoadingScreen>{loader}</LoadingScreen>,
                    container
                )
                : null}
            { createPortal(
                <>
                    <CountdownContainer ref={countDownContainer} style={{ width: "330px", height: "auto" }}>
                        <CountdownText isVisible={!(recordingStartTimeout == null)}>{store.countDownMessage}</CountdownText>
                    </CountdownContainer>
                    <Preview
                        isVideoMode
                        snapShotTaken={snapshotTaken}
                        onSnapshotClose={onSnapshotCloseHandler}
                        snapShotPreviewVideoRef={snapShotPreviewVideoRef}
                        videoBlob={capturedBlob}
                        isVideoLoading={isLoading}
                    />
                </>,
                container
            )}
        </RootRecord>
    );
};
