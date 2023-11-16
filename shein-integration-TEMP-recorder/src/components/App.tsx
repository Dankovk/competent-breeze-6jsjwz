import React, { type ReactNode, useState, useMemo } from "react";
import { ThemeProvider } from "styled-components";
import { lightTheme } from "../theme";
import { CameraUiLayer } from "./CameraUI/camera-ui-layer.component";
import { UploadVideo } from "./UploadVideo/upload-video.component";
import { store } from "../store/store";
import { BackButtonComponent } from "./BackButton/back-button.component";
import { observer } from "../store/observer.component";
import { FullScreenLoader } from "./Loader/FullScreenLoader";
import { Instructions } from "./Instructions/main-instructions.component";
import { ErrorScreen } from "./ErrorScreen/error.component";
import { ERROR_CODES, MESSAGES, RECORD_DELAY } from "@/constants";
import { BuyButton } from "./BuyButton/buy-button.component";

class ErrorBoundary extends React.Component {
    state: Readonly<{ hasError: boolean, isInternerConnectionLost?: boolean }>;
    props!: Readonly<{ children: ReactNode }>;

    constructor (props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false };
        window.addEventListener("offline", () => {
            this.setState({ hasError: true, isInternerConnectionLost: true });
        });
    }

    static getDerivedStateFromError () {
        return { hasError: true };
    }

    componentDidCatch () {
        window.parent.postMessage({ type: MESSAGES.IFRAME_LOADED }, "*");
        window.parent.postMessage({ type: MESSAGES.ERROR, code: ERROR_CODES.JS, message: "JS error occurred" }, "*");
        store.isError = true;
    }

    render (): ReactNode {
        if (this.state.hasError) {
            return <>
                {!this.state.isInternerConnectionLost && <BackButtonComponent onClick={() => {
                    window.parent.postMessage({ type: MESSAGES.START_AR, isInternalEvent: true }, "*");
                }} />}
                <ErrorScreen />
            </>;
        }

        return this.props?.children;
    }
}

export const App = observer(({
    isConcentStepFinished, isConcentAccepted,
    isCameraAccessAllowed, isError, isAds
}: { isConcentStepFinished: boolean, isConcentAccepted: boolean, isCameraAccessAllowed: boolean, isError: boolean, isAds: boolean }) => {
    const [isCameraUiVisible, setIsCameraUiVisible] = useState(false);
    const onDetectedHandler = (val: boolean) => { setIsCameraUiVisible(val); };

    const onBackButtonClickHandler = () => {
        if (!isConcentAccepted || isError) {
            window.parent.postMessage({ type: MESSAGES.START_AR, isInternalEvent: true }, "*");
        }
        store.emitter?.emit("upload-to-first-step");
    };

    const showUploadVideo = useMemo(() => isConcentStepFinished && !isCameraAccessAllowed, [isConcentStepFinished, isCameraAccessAllowed]);

    return <ThemeProvider theme={lightTheme}>
        <ErrorBoundary>
            <FullScreenLoader />
            {showUploadVideo && <UploadVideo onDetected={onDetectedHandler}/> }
            <Instructions />
            {!isAds && <div style={{ display: (isError || isCameraUiVisible || !isConcentAccepted) ? "block" : "none" }}>{
                (isError || !isConcentAccepted || !isCameraAccessAllowed) && <BackButtonComponent onClick={onBackButtonClickHandler} />}
            </div>}
            <div style={{ display: (!isError && (isCameraUiVisible || (isConcentAccepted && isCameraAccessAllowed))) ? "block" : "none" }}>
                {isAds ? <BuyButton /> : <CameraUiLayer delay={showUploadVideo ? 0 : RECORD_DELAY} />}

            </div>
        </ErrorBoundary>
        { isError && <ErrorScreen />}
    </ThemeProvider>;
}, ["isConcentStepFinished", "isConcentAccepted", "isCameraAccessAllowed", "isError", "isAds"]);
