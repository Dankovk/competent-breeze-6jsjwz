import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { type CanvasRenderer } from "@geenee/armature";
import {
    isAndroid,
    isIOS,
    isFirefox,
    isSafari
} from "@/utils/deviceInformation";
import { type Nullable } from "@babylonjs/core";

const VIDEO_OPTIONS = {
    safari: {
        extension: ".mp4",
        mimeType: "video/mp4;",
        codec: ""
    },
    firefox: {
        extension: ".webm",
        mimeType: "video/webm;",
        codec: "codecs:vp9"
    },
    other: {
        extension: ".webm",
        mimeType: "video/webm;",
        codec: "codecs=h264"
    }
};

function getVideoOptions (options: {
    [key in "safari" | "firefox" | "other"]: VideoOptions;
}) {
    if (isAndroid() || isFirefox) return options.firefox;
    else if (isIOS() || isSafari) return options.safari;
    else return options.other;
}

interface VideoOptions {
    extension: ".webm" | ".mp4"
    mimeType: "vedeo/webm" | "video/mp4"
    codec: "" | "codecs:vp9" | "codecs=h264"
}

export class RecorderOfAHealthy {
    isLoading = false;
    private readonly canvas: HTMLCanvasElement;
    private readonly offscreenCanvas: Nullable<HTMLCanvasElement> = null;
    mediaRecorder: MediaRecorder | null = null;
    stream: MediaStream | null = null;
    renderer: CanvasRenderer;
    ffmpeg = new FFmpeg();
    recording = false;
    frames: Uint8Array[] = [];
    chunks: Blob[] = [];
    videoOptions: Nullable<VideoOptions> = null;

    constructor (renderer: CanvasRenderer) {
        this.renderer = renderer;
        this.canvas = renderer.shaderCtx.canvas;
        this.offscreenCanvas = this.createHiddenCanvas(
            this.canvas.width,
            this.canvas.height
        );
        this.stream = this.canvas.captureStream(30);

        console.log("RecorderOfAHealthy", renderer);
    }

    async init () {
        this.videoOptions = getVideoOptions(VIDEO_OPTIONS);

        if (!this.ffmpeg.loaded) {
            await this.load();
        }

        console.log("Init: ", { videoOptions: this.videoOptions });
    }

    createMediaRecorder () {
        const { mimeType, codec } = this.videoOptions;
        const options = {
            mimeType: `${mimeType}${codec}`
        };

        this.mediaRecorder = new MediaRecorder(this.stream, options);
        this.mediaRecorder.ondataavailable = this.handleDataAvailable;
        this.mediaRecorder.onstop = this.handleStop;
    }

    load = async () => {
        const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/umd";

        this.ffmpeg.on("log", ({ message }) => {
            console.log(message);
        });

        this.isLoading = true;
        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        const response = await this.ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
            wasmURL: await toBlobURL(
                `${baseURL}/ffmpeg-core.wasm`,
                "application/wasm"
            ),
            workerURL: await toBlobURL(
                `${baseURL}/ffmpeg-core.worker.js`,
                "application/javascript"
            )
        });
        this.isLoading = false;

        return response;
    };

    async start () {
        console.log("Start");

        this.frames = [];
        this.recording = true;

        try {
            this.captureFrame();
        } catch (error) {
            console.error(error);
        }
    }

    async stop () {
        console.log("Stop", this.frames);

        this.recording = false;

        try {
            return await this.processVideo();
        } catch (error) {
            console.error(error);
        }
    }

    private createHiddenCanvas (width: number, height: number) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.style.display = "none;";

        return canvas;
    }

    private flipPixelsVertically (pixels, width, height) {
        const flippedPixels = new Uint8Array(pixels.length);
        const numBytesPerRow = width * 4;

        for (let row = 0; row < height; row++) {
            const srcRowStart = row * numBytesPerRow;
            const destRowStart = (height - 1 - row) * numBytesPerRow;
            for (let i = 0; i < numBytesPerRow; i++) {
                flippedPixels[destRowStart + i] = pixels[srcRowStart + i];
            }
        }

        return flippedPixels;
    }

    private async createFrame (pixels, width, height): Promise<Uint8Array> {
        if (this.offsetContext == null) return;

        const imageData = this.offsetContext.createImageData(width, height);
        imageData.data.set(pixels);
        this.offsetContext.putImageData(imageData, 0, 0);

        const blob = await new Promise<Blob>((resolve) => {
            this.offscreenCanvas.toBlob(resolve, "image/jpeg");
        });

        const buffer = await blob.arrayBuffer();
        return new Uint8Array(buffer);
    }

    captureFrame () {
        if (!this.recording) return;
        if (this.visibleContext == null) return;

        const pixels = new Uint8Array(
            this.visibleContext.drawingBufferWidth *
            this.visibleContext.drawingBufferHeight *
            4
        );
        this.visibleContext.readPixels(
            0,
            0,
            this.visibleContext.drawingBufferWidth,
            this.visibleContext.drawingBufferHeight,
            this.visibleContext.RGBA,
            this.visibleContext.UNSIGNED_BYTE,
            pixels
        );

        const flippedPixels = this.flipPixelsVertically(
            pixels,
            this.visibleContext.drawingBufferWidth,
            this.visibleContext.drawingBufferHeight
        );

        this.frames.push(flippedPixels);

        requestAnimationFrame(() => { this.captureFrame(); });
    }

    get offsetContext () {
        if (this.offscreenCanvas == null) return;

        return this.offscreenCanvas.getContext("2d", { willReadFrequently: true });
    }

    get visibleContext () {
        return this.canvas.getContext("webgl2", { willReadFrequently: true });
    }

    async processFrames () {
        console.log("PROCESS FRAMES");

        await Promise.all(
            this.frames.map(async (frame, i) => {
                const num = `00${i}`.slice(-3);
                const data = await this.createFrame(
                    frame,
                    this.canvas?.width,
                    this.canvas?.height
                );

                await this.ffmpeg.writeFile(`frame_${num}.jpg`, data);
            })
        );
    }

    async processVideo () {
        if (this.videoOptions == null) return;
        if (this.visibleContext == null) return;
        if (this.offsetContext == null) return;

        console.log("PROCESS VIDEO");

        await this.processFrames();

        const exec = await this.ffmpeg.exec([
            "-framerate",
            "30",
            "-pattern_type",
            "glob",
            "-i",
            "frame_*.jpg",
            "-c:a",
            "copy",
            "-shortest",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "output.mp4"
        ]);

        const data = await this.ffmpeg.readFile("output.mp4");
        console.log("Process video data:", { data, exec });
        return new Blob([data.buffer], { type: "video/mp4" });
    }
}
