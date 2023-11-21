// @TODO: Add performance log and check logs overall

import "./index.css";
import { initReact } from "./react-init";
import { type StoreType, store } from "./store/store";
import { ENV, ERROR_CODES, EVENTS, LOGDNA_KEY, MESSAGES, VERSION, SENTRY_DSN } from "./constants";
import { getLoadingTime } from "./utils/log";

import { Recorder } from "./service/recorder.service";
import { Snapshoter } from "./service/snapshoter.service";
import { RecorderOfAHealthy } from "@/components/ScreenCapture/component/Record/Record.service";

import { imageProcess } from "@/utils/videocapture";
import logdna from "@logdna/browser";
import { init as SentryInit, BrowserTracing } from "@sentry/browser";
import { CaptureConsole } from "@sentry/integrations";
import { blockDragPropagation } from "@/utils/block-drag-propagation";
import { isIosWebView } from "@/utils/deviceInformation";
import { AnalyticsService } from "@/service/analytics.service";

interface initDomResultType {
    container: HTMLDivElement
    canvasContainer: HTMLDivElement
    styleContainer: HTMLDivElement
    shadow: ShadowRoot
};

const initEventListening = (store: StoreType) => {
    window.addEventListener(
        "message",
        async (event) => {
            // @TODO: add security check for event.origin
            switch (event.data?.type) {
                case MESSAGES.START_AR:
                    store.log(`Received message: ${MESSAGES.START_AR}`);
                    await startSDK(store);
                    break;
                case MESSAGES.CAMERA_ACCESS_CANCEL:
                    store.log(`Received message: ${MESSAGES.CAMERA_ACCESS_CANCEL}`);
                    store.isConcentAccepted = false;
                    store.isConcentStepFinished = true;
                    store.isCameraAccessAllowed = false;
                    window.parent.postMessage({ type: MESSAGES.IFRAME_LOADED }, "*");
                    break;
                case MESSAGES.CHANGE_SKU:
                    store.fullScreenLoaderShow = true;
                    try {
                        const isSuccess = await store.renderer?.loadModel(event.data?.sku);
                        if (isSuccess === false) {
                            store.isError = true;
                        } else if (isSuccess === true) {
                            store.log(EVENTS.CHANGE_SKU, { eventName: EVENTS.CHANGE_SKU, eventData: { newSKU: event.data?.sku } });
                            window.parent.postMessage({ type: MESSAGES.IFRAME_LOADED }, "*");
                            store.fullScreenLoaderShow = false;
                        }
                    } catch (e) {
                        store.log("Change SKU error: ", e?.toString());
                    }
                    break;
                default:
                    break;
            }
        }
    );

    window.parent.postMessage({ type: MESSAGES.READY_TO_LISTEN }, "*");
};

const initDomElements = (store: StoreType): initDomResultType => {
    try {
        const host = document.querySelector("#react");

        const shadow = store.disableShadowDom ? document.createElement("div") : host?.attachShadow({ mode: "open" });

        if (shadow == null) throw new Error("ShadowRoot was not created");

        if (store.disableShadowDom && shadow instanceof HTMLDivElement) {
            shadow.style.width = "100%";
            shadow.style.height = "100%";
            host?.appendChild(shadow);
        }
        const styleContainer = document.createElement("div");
        styleContainer.style.height = "100%";
        shadow.appendChild(styleContainer);

        const styles = Object.assign(
            document.createElement("style"),
            {
                innerHTML: `
                    #container {
                        font-family: 'SF UI Text', sans-serif;
                    }   
                    
                    canvas:focus-visible {
                        outline: none;
                    }
                `
            });

        styleContainer.appendChild(styles);

        const container = Object.assign(document.createElement("div"), {
            id: "container",
            style: "height: 100%"
        });

        styleContainer.appendChild(container);

        const canvasContainer = Object.assign(document.createElement("div"), {
            id: "root",
            style: "width: 100%; height: 100%; position: absolute; z-index: 0;"
        });

        shadow.prepend(canvasContainer);

        store.documentRef = store.disableShadowDom ? document : shadow as ShadowRoot;

        return { container, canvasContainer, styleContainer, shadow };
    } catch (e) {
        const message = "Error while initing DOM elements";
        store.isError = true;
        console.error(message);
        window.parent.postMessage({ type: MESSAGES.ERROR, code: ERROR_CODES.INIT_DOM, message }, "*");
        throw e;
    }
};

export const initSDK = async (store: StoreType, container: HTMLElement | null, mode: "crop" | "fit" | "pad" = "crop"): Promise<boolean> => {
    if (container == null) {
        return false;
    }
    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { Renderer, isRear, notifyPlugin, recorderExtension, setupEngineParams, engine, sdkToken, log } = store;
        const startedAt = performance.now();
        log("Init SDK Started", { eventName: EVENTS.INIT_SDK_STARTED, eventData: { startedAt } });
        // @ts-expect-error
        const renderer = new Renderer(container, mode);
        renderer.getModelId = () => store.currentModelId;

        renderer.setMirror(!isRear);

        await renderer.addPlugin(notifyPlugin);

        store.renderer = renderer;

        const watermarkImage = await imageProcess("./images/watermark.png");

        // store.recorder = new Recorder(
        //     renderer,
        //     recorderExtension,
        //     false,
        //     "video",
        //     undefined,
        //     8000000,
        //     watermarkImage.image
        // );
        store.recorder = new RecorderOfAHealthy(renderer);
        await store.recorder.init();

        store.snapshoter = new Snapshoter(
            renderer,
            false,
            null,
            null,
            watermarkImage.image
        );

        store.emitter?.on("camera-switch", async () => {
            const newIsRear = !store.isRear;
            store.isRear = newIsRear;
            log("Camera switched", { eventName: EVENTS.CAMERA_SWITCH, eventData: { isRear: newIsRear } });
            await engine.setup(setupEngineParams());
            await engine.start();
            renderer.setMirror(!newIsRear);
        });

        await Promise.all([
            engine.addRenderer(renderer),
            engine.init(store.engineInitParams)
        ]);

        store.isSDKInitied = true;
        store.emitter?.emit("sdk-init-finished");
        const finishedAt = performance.now();
        log("Init SDK Finished", {
            eventName: EVENTS.INIT_SDK_FINISHED,
            eventData: { finishedAt, loadingTime: getLoadingTime(startedAt, finishedAt) }
        });
        return true;
    } catch (e) {
        const message = "Error while initing SDK";
        store.isError = true;
        console.error(`${message}: `, e?.toString());
        window.parent.postMessage({ type: MESSAGES.ERROR, code: ERROR_CODES.INIT_SDK, message }, "*");
        return false;
    }
};

const startSDK = async (store: StoreType) => {
    try {
        const { isError, isSDKInitied, log, engine } = store;

        if (isError) {
            console.error("Start SDK aborted due to error");
            return false;
        }

        if (!isSDKInitied) {
            store.emitter?.once("sdk-init-finished", async (e) => {
                await startSDK(store);
            });
            return false;
        }
        const startedAt = performance.now();
        log("Start SDK Started", { eventName: EVENTS.START_SDK_STARTED, eventData: { startedAt } });

        const isCameraAccessAllowed = await engine.setup(store.setupEngineParams());
        store.isConcentAccepted = true;
        store.isConcentStepFinished = true;
        store.isCameraAccessAllowed = isCameraAccessAllowed;

        if (isCameraAccessAllowed) {
            log("Engine Start");
            await engine?.start();
            log("Engine Started");
            store.isSDKStarted = true;
            store.renderer?.once("render", () => {
                const finishedAt = performance.now();
                log(`Send message: ${MESSAGES.IFRAME_LOADED}`);
                window.parent.postMessage({ type: MESSAGES.IFRAME_LOADED }, "*");
                log("Start SDK Finished", {
                    eventName: EVENTS.START_SDK_FINISHED,
                    eventData: { finishedAt, loadingTime: getLoadingTime(startedAt, finishedAt) }
                });
            });
            AnalyticsService.runHeartbeatEvents();
        } else {
            window.parent.postMessage({ type: MESSAGES.IFRAME_LOADED }, "*");
            const finishedAt = performance.now();
            log("Start SDK Finished", {
                eventName: EVENTS.START_SDK_FINISHED,
                eventData: { finishedAt, loadingTime: getLoadingTime(startedAt, finishedAt) }
            });
        }

        blockDragPropagation();

        try {
            // Remove resize listener to reduce flashing screen
            if (isIosWebView()) {
                store.renderer?.canvas?.removeAllListeners("resize");
            }
        } catch (e) {
            store.log(`Error while detecting if IOS WebView: ${e}`);
        }

        return true;
    } catch (e) {
        const message = "Error while starting SDK";
        store.isError = true;
        console.error(`${message}: `, e?.toString());
        window.parent.postMessage({ type: MESSAGES.ERROR, code: ERROR_CODES.START_SDK, message }, "*");
        return false;
    }
};

void (async () => {
    try {
        LOGDNA_KEY && logdna.init(LOGDNA_KEY, { app: `shein-integration-${ENV}` });
        SENTRY_DSN && SentryInit({
            dsn: SENTRY_DSN,
            environment: ENV,
            integrations: [
                new BrowserTracing(),
                new CaptureConsole({
                    levels: ["error"]
                })
            ],
            release: VERSION,
            tracesSampleRate: 1.0,
            attachStacktrace: true
        });

        const { container, canvasContainer, styleContainer } = initDomElements(store);

        initReact(store, container, styleContainer);

        await initSDK(store, canvasContainer);

        initEventListening(store);

        if (!store.isFrame) {
            await startSDK(store);
        }
    } catch (e) {
        const message = "Error while application run";
        console.error(`${message}: `, e?.toString());
        window.parent.postMessage({ type: MESSAGES.ERROR, code: ERROR_CODES.START_APP, message }, "*");
    }
})();
