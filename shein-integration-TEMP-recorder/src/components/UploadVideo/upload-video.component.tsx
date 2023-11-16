import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { uploadStatusConfig, type UploadStatusConfigKey } from "./upload-status-config";
import { MainWrapper, Description, IconWrapper, Title, ContentWrapper, LogoWrapper } from "./upload-video.style";
// @TODO: Remove direct import of the store
import { store } from "../../store/store";
import { AnimatedProgressBar } from "./animated-progress-bar.component";
import { SheinLogo } from "@/assets/shein-logo";
import throttle from "lodash.throttle";
import { Button, ButtonsWrapper } from "../main.styles";
import { EVENTS, THROTTLE_CONSTANT } from "@/constants";
import { AnalyticsService } from "@/service/analytics.service";

export const UploadVideo = ({ onDetected }: { onDetected: (val: boolean) => void }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<UploadStatusConfigKey>("upload");

    const toggleDetection = throttle((isDetected: boolean) => {
        if (isDetected) {
            onDetected(true);
            setStatus("success");
        } else {
            if (!store.isRecording) {
                onDetected(false);
                setStatus("detectError");
            }
        }
    }, THROTTLE_CONSTANT);

    const [isLoaded, setIsLoaded] = useState(false);

    const stopEngine = useCallback((_status: UploadStatusConfigKey) => {
        store.emitter.removeAllListeners(store.detectedMessageName);
        store.emitter.removeAllListeners(store.notDetectedMessageName);
        store.engine?.pause();

        // Due to toggleDetection throttling we need to ensure that the latest status will be from stopEngine call
        setTimeout(() => {
            setStatus(_status);
            onDetected(false);
        }, THROTTLE_CONSTANT);
    }, []);
    useEffect(() => {
        store.emitter?.on("upload-to-first-step", () => {
            stopEngine("upload");
        });
        return () => {
            store.emitter?.removeAllListeners("upload-to-first-step");
        };
    }, []);
    const config = useMemo(() => uploadStatusConfig[status], [status]);

    const updateRendererMode = useCallback(async (mode: "crop" | "pad") => {
        if (mode === "crop") {
            store.renderer?.setMode("crop");
            store.renderer?.setMirror(!store.isRear);
            store.isRear = false;
        } else {
            store.renderer?.setMode("pad");
            store.renderer?.setMirror(false);
            store.isRear = true;
        }
    }, []);

    useEffect(() => {
        updateRendererMode("pad");
        return () => {
            updateRendererMode("crop");
        };
    }, []);

    const onChange = useCallback(async (e: any) => {
        const files = e.target.files;
        const selectedVideo = files?.length > 0 ? files[0] : undefined;
        e.target.value = null;
        if (!selectedVideo?.type?.includes("video")) {
            stopEngine("wrongFormat");
            return;
        }
        if (selectedVideo) {
            setStatus("loading");
            setIsLoaded(false);
            const videoURL = URL.createObjectURL(selectedVideo);
            const videoElem = document.createElement("video");
            videoElem.src = videoURL;

            AnalyticsService.triggerEvent("upload_video");

            videoElem.onloadedmetadata = async () => {
                store.engine.pause();
                await store.engine?.setup(videoURL);
                await store.engine?.start();
                store.isSDKStarted = true;
                setIsLoaded(true);

                store.log(EVENTS.VIDEO_UPLOAD, { eventName: EVENTS.VIDEO_UPLOAD });
                AnalyticsService.runHeartbeatEvents();
            };
        };
    }
    , []);

    const animationOnSuccessHandler = () => {
        store.emitter?.on(store.detectedMessageName, () => {
            toggleDetection(true);
        });
        store.emitter?.on(store.notDetectedMessageName, () => {
            toggleDetection(false);
        });
    };

    const buttonOnclickHandler = () => {
        inputRef.current?.click();
    };

    return <MainWrapper status={status} >
        {status !== "detectError" && <LogoWrapper>
            <SheinLogo />
        </LogoWrapper>}
        <ContentWrapper status={status}>
            <IconWrapper>{config.icon}</IconWrapper>
            <Title isWhite={status === "detectError"}>{config.title}</Title>
            <Description isWhite={status === "detectError"}>{config.description}</Description>
            {status === "loading" && <AnimatedProgressBar success={isLoaded} onSuccess={animationOnSuccessHandler} />}
        </ContentWrapper>
        <ButtonsWrapper>
            {config.buttonText && <Button
                id={"upload-video-button"}
                viewType="primary"
                onClick={buttonOnclickHandler}
            >
                {config.buttonIcon}
                <div>
                    {config.buttonText}
                </div>
            </Button>}
        </ButtonsWrapper>
        {/* TODO: check gifs handling after implementation image functionality  */}
        <input
            hidden
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={ onChange }
        />
    </MainWrapper>;
};
