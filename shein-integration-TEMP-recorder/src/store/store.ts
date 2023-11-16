import EventEmitter from "events";
import itemsConfig from "@/itemsConfig.json";
import { FaceEngine, PoseEngine } from "@geenee/bodyprocessors";
import {
  type BabylonPlugin,
  type BabylonUniRenderer,
} from "@geenee/bodyrenderers-babylon";
import { FaceRenderer } from "@/renderers/face-renderer";
import { HatRenderer } from "@/renderers/hat-renderer";
import { type Recorder, type Snapshoter } from "@geenee/armature";
import { isAndroid, isIOS as isIos, isMobile } from "@/utils/deviceInformation";
import log from "@/utils/log";
import { PoseProcessor } from "../processors/poseprocessor";
import { Engine as BagEngine } from "@/engines/engine";
import { BagRenderer } from "@/renderers/bag-renderer";
import { FaceStateNotifier } from "@/plugins/face-notifier-plugin";
import { PoseStateNotifier } from "@/plugins/pose-notifier.plugin";
import { VideoCapture } from "@/utils/videocapture";
import { HeadRenderer } from "@/renderers/head.renderer";
import { AvatarPoseRenderer } from "@/renderers/avatar-pose-renderer";
import { DETECTED_MESSAGE_NAME, NOT_DETECTED_MESSAGE_NAME } from "@/constants";
import { FaceInstructions } from "@/components/Instructions/face-instructions.component";
import { BodyInstructions } from "@/components/Instructions/body-instructions.component";
import { DragInstructions } from "@/components/Instructions/drag-instructions.component";
import { type InstructionsProps } from "@/components/Instructions/main-instructions.component";
import {
  type SKUKeys,
  skuTypeMap,
  SwiperOptionsConfig,
  BodyExperienceTypeNames,
} from "@/utils/skuHelper";
import { EarringsRenderer } from "@/renderers/earrings.renderer";
import { AvatarShoulderRenderer } from "@/renderers/avatar-shoulder.renderer";
import { HairclipsRenderer } from "@/renderers/hair-clips-renderer";
import { BagInstructions } from "@/components/Instructions/bag-instructions.component";
export interface SwitchOption {
  id: string;
}

const searchParams = new URLSearchParams(document.location.search);
const isAds = searchParams.get("ads");
const isFrame = searchParams.get("frame");
const rear = searchParams.has("rear");
const isProd = searchParams.has("prod");
const isDebug = searchParams.has("debug");
const buyUrl = searchParams.get("buyUrl") ?? "";
const isDev = searchParams.has("dev");
const disableShadowDom = searchParams.has("wsd");
const sku = (searchParams.get("sku") ?? "") as SKUKeys;
const isIOS = isIos();
const isSafari = /^((?!chrome|android).)*(safari|sheinapp)/i.test(
  navigator.userAgent,
);

let engineInitParams: Record<string, any> = {};
let engine = null;
let Renderer = null;

const sdkToken =
  isAds && process.env.SDK_TOKEN_ADS
    ? process.env.SDK_TOKEN_ADS
    : process.env.SDK_TOKEN;

const engineInitSettings = {
  FaceEngine: { token: sdkToken, transform: true, metric: true },
  PoseEngine: { token: sdkToken, mask: true },
  BagEngine: { token: sdkToken },
};

const notifyHandler = (detected: boolean) => {
  if (detected) {
    store.emitter?.emit(DETECTED_MESSAGE_NAME);
  } else {
    store.emitter?.emit(NOT_DETECTED_MESSAGE_NAME);
  }
};

const switchOptions: SwitchOption[] = SwiperOptionsConfig[sku] || [];
const listeners: Record<string, unknown> = {};
let isError = false;

const experienceType = skuTypeMap[sku];

let notifyPlugin: FaceStateNotifier | PoseStateNotifier = new FaceStateNotifier(
  notifyHandler,
);
let InstructionComponent = FaceInstructions;

let countDownMessage = "";
if (experienceType in BodyExperienceTypeNames) {
  notifyPlugin = new PoseStateNotifier(notifyHandler);
  InstructionComponent = BodyInstructions;
  engineInitParams = engineInitSettings.PoseEngine;
  countDownMessage =
    "Step back so that your entire body is fully within the frame.";
} else {
  engineInitParams = engineInitSettings.FaceEngine;
}

switch (experienceType) {
  case "hat": {
    engine = new FaceEngine();
    Renderer = HatRenderer;
    break;
  }
  case "glasses": {
    engine = new FaceEngine();
    Renderer = FaceRenderer;
    break;
  }
  case "headbands": {
    engine = new FaceEngine();
    Renderer = HeadRenderer;
    break;
  }
  case "bag": {
    // @ts-expect-error
    engine = new BagEngine(PoseProcessor);
    Renderer = BagRenderer;
    engineInitParams = engineInitSettings.BagEngine;
    InstructionComponent = BagInstructions;
    break;
  }
  case "shoulderbag": {
    // @ts-expect-error
    engine = new BagEngine(PoseProcessor);
    Renderer = AvatarShoulderRenderer;
    engineInitParams = engineInitSettings.BagEngine;
    break;
  }
  case "earmuffs": {
    engine = new FaceEngine();
    Renderer = HeadRenderer;
    break;
  }
  case "earrings": {
    engine = new FaceEngine(undefined, VideoCapture);
    Renderer = EarringsRenderer;
    InstructionComponent = DragInstructions;
    break;
  }
  case "hairclips": {
    engine = new FaceEngine(undefined, VideoCapture);
    Renderer = HairclipsRenderer;
    InstructionComponent = DragInstructions;
    break;
  }
  case "clothes": {
    engine = new PoseEngine();
    Renderer = AvatarPoseRenderer;
    break;
  }
  default: {
    engine = new FaceEngine();
    Renderer = FaceRenderer;
    engineInitParams = engineInitSettings.FaceEngine;
    log(isDebug);
    isError = true;
  }
}

export interface StoreType {
  log: (message: string, sendingToParentData?: unknown) => void;
  isMobile: boolean;
  buyUrl: string;
  isDev: boolean;
  downloadFileName: string;
  isDebug: boolean;
  isError: boolean;
  isFrame: boolean;
  isSDKInitied: boolean;
  isSDKStarted: boolean;
  isAds: boolean;
  isRear: boolean;
  isRecording: boolean;
  isIOS: boolean;
  isSafari: boolean;
  recorderExtension: string;
  sdkToken: string;
  isConcentAccepted: boolean | null;
  isConcentStepFinished: boolean;
  isCameraAccessAllowed: boolean | null;
  currentModelId: SKUKeys;
  documentRef: Document | ShadowRoot;
  detectedMessageName: string;
  countDownMessage: string;
  notDetectedMessageName: string;
  notifyPlugin: BabylonPlugin;
  switchOptions: SwitchOption[];
  engineInitParams: Record<string, any>;
  engine: FaceEngine | BagEngine<any, any, any> | PoseEngine;
  Renderer: BabylonUniRenderer;
  renderer:
    | AvatarPoseRenderer
    | BagRenderer
    | FaceRenderer
    | HatRenderer
    | HeadRenderer
    | EarringsRenderer
    | null;
  snapshoter: Snapshoter | null;
  recorder: Recorder | null;
  emitter: EventEmitter;
  fullScreenLoaderShow: boolean;
  disableShadowDom: boolean;
  InstructionComponent: React.ComponentType<InstructionsProps>;
  setupEngineParams: () =>
    | { size?: { width: number; height: number }; rear: boolean }
    | MediaStream;
  trigger: (propertyName: string, value: any) => void;
  observe: (propertyName: string, callback: () => any) => void;
  isIosWebView: () => boolean;
}

const getRecorderExtension = () => {
  if (isIOS || isSafari) {
    return "video/mp4";
  }
  if (isAndroid()) {
    return "video/webm;codecs=vp9";
  }
  return "video/webm;codecs=h264";
};

export const store: StoreType = new Proxy<StoreType>(
  {
    onComplete: () => {},
    setModel: () => {},
    isMobile: isMobile(),
    buyUrl,
    log: log(isDebug),
    downloadFileName: `shein-${skuTypeMap[sku]}`,
    isDebug,
    isError,
    isDev,
    isSDKInitied: false,
    isSDKStarted: false,
    isAds: !!isAds,
    isRear: !!rear,
    isRecording: false,
    isFrame: !!isFrame || !!isAds,
    engineInitParams,
    sdkToken,
    isConcentAccepted: null,
    isConcentStepFinished: false,
    isCameraAccessAllowed: null,
    currentModelId: sku,
    emitter: new EventEmitter(),
    isIOS,
    isSafari,
    recorderExtension: getRecorderExtension(),
    documentRef: document,
    recorder: null,
    snapshoter: null,
    detectedMessageName: DETECTED_MESSAGE_NAME,
    notDetectedMessageName: NOT_DETECTED_MESSAGE_NAME,
    countDownMessage,
    notifyPlugin,
    InstructionComponent,
    switchOptions,
    engine,
    fullScreenLoaderShow: false,
    // @ts-expect-error
    Renderer,
    disableShadowDom,
    renderer: null,
    listeners,
    setupEngineParams() {
      return Reflect.get(store, "isMobile")
        ? { rear: Reflect.get(store, "isRear") }
        : {
            size: { width: 1920, height: 1080 },
            rear: Reflect.get(store, "isRear"),
          };
    },
    observe: (propertyName: string, callback: () => any) => {
      if (listeners[propertyName]) {
        // @ts-expect-error
        listeners[propertyName].push(callback);
      } else {
        listeners[propertyName] = [callback];
      }
    },
    trigger: (propertyName: string, value: any) => {
      if (listeners[propertyName]) {
        // @ts-expect-error
        listeners[propertyName].forEach((cb) => cb(value));
      }
    },
  },
  {
    get: function (target: StoreType, property: keyof StoreType) {
      if (property === "currentModelId") {
        const urlParams = new URLSearchParams(window.location.search);
        let currentModelId = urlParams.get("model") ?? sku;
        // @ts-ignore
        if (!itemsConfig[currentModelId]) {
          currentModelId = sku;
        }
        return currentModelId;
      }
      return target[property];
    },
    set(target: StoreType, property: keyof StoreType, value: any) {
      if (property === "setupEngineParams") {
        target[property] = () => {
          return value;
        };
      } else {
        // @ts-ignore
        target[property] = value;
      }
      target.trigger(property as string, value);
      return true;
    },
  },
);
