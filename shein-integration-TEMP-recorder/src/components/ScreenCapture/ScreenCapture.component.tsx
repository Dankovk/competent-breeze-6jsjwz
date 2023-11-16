import React, { type ReactNode, useMemo, useRef, useState } from "react";

import { Record } from "./component/Record/Record.component";
import { Snapshot } from "./component/Snapshot/Snapshot.component";

import { useLottie } from "./hook/useLottie";

import {
    CameraActionsContainer,
    ScreenCaptureRoot,
    ToggleAnimWrapper
} from "./styles";

interface Props {
    id?: string
    isAdsMode?: boolean
    loader?: ReactNode | string
    children: ReactNode
    onClick: CallbackFunctionVariadic
}

const className = "screen-capture";

export const ScreenCapture: React.FC<Props> = ({
    id = "screen-capture",
    loader = "loading",
    isAdsMode,
    children,
    onClick
}) => {
    const [activeMode, setActiveMode] = useState<"photo" | "video">("photo");
    const toggleContainer = useRef();

    const isPhotoMode = activeMode === "photo";
    const isVideoMode = activeMode === "video";

    const animationConfig = useMemo(() => ({
        toggleAnimation: {
            containerRef: toggleContainer,
            path: "./lottie/camera-toggle.json"
        }
    }), []);

    const { toggleAnimation } = useLottie(animationConfig);

    const onRecordClick = () => {
        if (isPhotoMode) {
            setActiveMode("video");
            toggleAnimation?.setDirection(1);
            toggleAnimation?.play();

            return false;
        }
        onClick();
        return true;
    };

    const onSnapshotClick = () => {
        if (isVideoMode) {
            setActiveMode("photo");
            toggleAnimation?.setDirection(-1);
            toggleAnimation?.play();

            return false;
        }
        onClick();
        return true;
    };

    const renderChildren = (c: ReactNode, index: number) => {
        switch (c.type) {
            case ToggleAnimWrapper:
                return React.cloneElement(c, {
                    ref: toggleContainer
                });

            case Record:
                return React.cloneElement(c, {
                    key: index,
                    previewPortalId: c.props?.portalId || id,
                    onRecordClick,
                    loader
                });

            case Snapshot:
                return React.cloneElement(c, {
                    key: index,
                    previewPortalId: c.props?.portalId || id,
                    onClick: onSnapshotClick
                });

            default:
                return c;
        }
    };

    return (
        <ScreenCaptureRoot id={id}>
            <div className={`${className}`}>
                <div className={`${className}-ui`}
                    style={{ ...isAdsMode && { transform: "translateX(-50%) scale(0.6)", bottom: 0 } }}>
                    <CameraActionsContainer right={isPhotoMode} left={isVideoMode}>
                        {children && React.Children.map(children, renderChildren)}
                    </CameraActionsContainer>
                </div>
            </div>
        </ScreenCaptureRoot>
    );
}
;
