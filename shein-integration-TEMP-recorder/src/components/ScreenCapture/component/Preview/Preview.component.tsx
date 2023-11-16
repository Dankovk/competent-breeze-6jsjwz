import React, { useEffect, useState } from "react";
import { DownloadInstructions } from "../DownloadInstructions/download-instuctions.component";
import { VideoPreview, PreviewRoot, Flash, PreviewContent } from "./styles";
import { store } from "@/store/store";
import { Button, ButtonsWrapper } from "@/components/main.styles";
import { EVENTS } from "@/constants";
import { createBase64FromBlob, getBlobDuration } from "@/utils/video-helper";
import fixWebmDuration from "fix-webm-duration";

interface Props {
    snapShotTaken: boolean | null
    isVideoMode: boolean
    snapShotPreviewImgRef: any
    snapShotPreviewVideoRef: any
    videoBlob?: Blob | null
    onSnapshotClose: any
    isVideoLoading: boolean
}

const videoExt = store.isIOS || store.isSafari ? "mp4" : "webm";
const videoType = `video/${videoExt}`;

export const Preview = ({
    snapShotTaken,
    isVideoMode,
    snapShotPreviewImgRef,
    snapShotPreviewVideoRef,
    videoBlob,
    onSnapshotClose = () => {
    },
    isVideoLoading
}: Props) => {
    const [showDownloadInstructions, setShowDownloadInstructions] = useState(false);

    const createFile = async () => {
        const lastModified = Date.now();

        if (isVideoMode && (videoBlob != null)) {
            const blob = await getVideoBlobWithDuration(videoBlob);
            return new File([blob], store.downloadFileName + "." + videoExt, { type: videoType, lastModified });
        }
        if (snapShotPreviewImgRef?.current) {
            const res = await fetch(snapShotPreviewImgRef.current.src);
            const blob = await res.blob();
            return new File([blob], store.downloadFileName + ".jpg", { type: "image/jpeg", lastModified });
        }
        return null;
    };

    const onOpenShareClick = async () => {
        store.fullScreenLoaderShow = true;
        let shared = false;
        if (store.isMobile && navigator.share) {
            store.log("File share");
            const file = await createFile();
            const data = (file != null) && { files: [file] };
            if (data != null) {
                shared = navigator.canShare(data);
                shared && await navigator.share(data).then(() => {
                    setShowDownloadInstructions(true);
                }).catch((e) => {
                    // Cancel error code
                    if (e.code !== 20) {
                        shared = false;
                        store.log(`Share error message:  + ${e.toString()}`);
                    }
                });
                store.fullScreenLoaderShow = false;

                shared && store.log("Share file finished", { eventName: EVENTS.FILE_SHARE });
            }
        }
        if (!shared) {
            store.log("File download");
            await onDownloadFile();
            shared = true;
        }

        if (!shared) { store.log("File sharing and download failed"); }

        setTimeout(() => {
            setShowDownloadInstructions(false);
        }, 3000);
    };

    const onDownloadFile = async () => {
        return await new Promise(resolve => {
            if (isVideoMode && (videoBlob != null)) {
                void generateVideoBase64(videoBlob).then(base64 => {
                    if (base64) {
                        onDownload(base64);
                        resolve(true);
                    }
                });
            } else {
                onDownload(snapShotPreviewImgRef.current.src);
                resolve(true);
            }
        });
    };

    const onDownload = (url: string) => {
        const a = document.createElement("a");
        a.href = url;
        a.download = store.downloadFileName + "." + videoExt;
        a.click();
        store.fullScreenLoaderShow = false;
        setShowDownloadInstructions(true);
        store.log("Download file finished", { eventName: EVENTS.FILE_DOWNLOAD });
    };

    const getVideoBlobWithDuration = async (_blob: Blob) => {
        let blob = _blob;

        if (videoType.includes("webm")) {
            const duration = await getBlobDuration(blob);
            if (duration !== null) {
                blob = await fixWebmDuration(blob, duration * 1000);
            }
        }
        return blob;
    };

    const generateVideoBase64 = async (_blob: Blob) => {
        const blob = await getVideoBlobWithDuration(_blob);
        return await createBase64FromBlob(blob);
    };

    useEffect(() => {
        if (snapShotTaken) {
            setShowDownloadInstructions(false);
        }
    }, [snapShotTaken]);

    return (
        <PreviewRoot onClick={() => {
            if (showDownloadInstructions) {
                onSnapshotClose();
            }
        }}>
            <PreviewContent isActive={!!snapShotTaken}>
                {isVideoMode
                    ? (
                        <VideoPreview
                            $loading={isVideoLoading}
                            preload="auto"
                            playsInline
                            autoPlay
                            ref={snapShotPreviewVideoRef}
                            src="/"
                            loop
                            controlsList="nodownload nofullscreen noremoteplayback"
                        />
                    )
                    : <img style={{ objectFit: "contain", background: "black" }} ref={snapShotPreviewImgRef} src="/"
                        alt=""/>}
                {!showDownloadInstructions
                    ? <ButtonsWrapper>
                        <Button
                            viewType="secondary"
                            onClick={() => {
                                onSnapshotClose();
                            }}
                        >
                            Try again
                        </Button>
                        <Button
                            viewType="primary"
                            onClick={() => {
                                onOpenShareClick();
                            }}
                        >
                            Save media
                        </Button>
                    </ButtonsWrapper>
                    : <DownloadInstructions/>}
            </PreviewContent>
            <Flash isActive={!!snapShotTaken}/>
        </PreviewRoot>
    );
};
