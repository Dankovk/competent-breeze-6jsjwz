import { VideoCapture, type VideoSource, type VideoSourceParams, ImageBuffer, type Processor, type ProcParams, type Renderer, type Size, EventEmitterT } from "@geenee/armature";

/** Parameters of Engine */
export interface EngineParams {
    /** Maximum processing size (resizing). If not defined
     * engine uses image size preferred by processor. */
    max?: number
    /** Preserve original resolution, default - true. */
    orig?: boolean
}
/** Events emitted by {@link Engine} */
interface EngineEvents {
    /** Engine initialized */
    init: (status: boolean) => void
    /** Engine set up */
    setup: (status: boolean) => void
    /** Pipeline started */
    start: () => void
    /** Pipeline stopped */
    pause: () => void
}

/**
 * Core generic engine
 *
 * Engine is a core of any app and organizer of a pipeline.
 * It's responsible to interact with lower-level instances and
 * at the same time provide simple and user-friendly interface.
 * Engine combines together data (video) capturing, processing
 * and rendering. It's created for particular {@link Processor}.
 * Processor's constructor is provided to the engine and former
 * initializes, sets up and controls state of processor during
 * life-circle of the application. Results of processing and
 * captured image are passed to a {@link Renderer} attached to
 * the Engine. Notable feature is fast rescaling of images for
 * processing down to the requested resolution in cases when
 * available camera output is bigger. Engine parameters have an
 * option to limit processed image size. Original video stream
 * can be preserved on request, this is useful when processing
 * cannot handle high resolution images but you still want to
 * render high quality video in your app. All core components:
 * Engine, Processor, and Renderer are generics parametrized by
 * type of processing results and optionally tuning parameters.
 *
 * @typeParam ProcessorT - Type of processor
 * @typeParam ResultT - Type of processing results
 * @typeParam ParamsT - Type of processor parameters
 */
export class Engine<ResultT extends {}, ParamsT extends ProcParams,
    ProcessorT extends Processor<ResultT, ParamsT>>
    extends EventEmitterT<EngineEvents> {
    /** Processor utilized by the engine */
    protected processor: ProcessorT;
    /** Renderer attached to the engine */
    protected renderers: Array<Renderer<ResultT>> = [];
    /** Video source instance */
    protected video: VideoSource;
    /** Ratio of video stream */
    protected videoRatio: number = 1920 / 1080;
    /** Shallow copy of canvas with video for renderers */
    protected streamCanvas?: HTMLCanvasElement;
    /** Size of video for renderers */
    protected streamSize: Size = { width: 1920, height: 1080 };
    /** Shallow copy of canvas with video for processors */
    protected processCanvas?: HTMLCanvasElement;
    /** Size of video for processors */
    protected processSize: Size = { width: 1920, height: 1080 };
    /** Buffer to resize frames */
    protected resizeBuffer?: ImageBuffer;
    /** Original stream is resized */
    protected resizeEnabled = false;
    /** State of the pipeline */
    private loopState = false;
    /** Id of current frame */
    private loopId?: number;

    /**
     * Constructor
     *
     * @param Processor - Processor class or its constructor
     * @param engineParams - Parameters of the engine
     * @param Source - Video source class or its constructor
     * @typeParam ProcessorT - Type of processor
     * @typeParam ResultT - Type of processing results
     * @typeParam ParamsT - Type of processor parameters
     */
    constructor (
        Processor: new () => ProcessorT,
        protected engineParams?: EngineParams,
        Source: new () => VideoSource = VideoCapture) {
        super();
        this.processor = new Processor();
        this.video = new Source();
        this.video.on("resize", this.resizeVideo.bind(this));
    }

    /**
     * Initialize engine. Sets up processor.
     *
     * The SDK {@link ProcParams#token | access token} is
     * required parameter that authenticates the user and
     * enables the SDK on the current url. By default, path
     * to required wasm modules provided with SDK packages
     * is the current url. You can change the root path to
     * wasms passing {@link ProcParams#root | root parameter}.
     *
     * @param - Parameters of the processor
     * @returns Status of initialization
     */
    init = async (procParams: ParamsT) => {
        const status = await this.setupProcessor(procParams);
        this.emit("init", status);
        return status;
    };

    /**
     * Setup engine. Initializes video capture.
     *
     * Video capture can be setup by simplified {@link VideoParams}
     * opening default front/rear camera with provided resolution,
     * custom MediaStreamConstraints providing the most flexible
     * way to setup video stream (e.g. set deviceId), or external
     * MediaStream allowing custom video sources (e.g. from file).
     *
     * @param videoParams - Parameters of video capture
     * @returns Status of initialization
     */
    setup = async (videoParams?: VideoSourceParams) => {
        this.pause();
        const status = await this.setupVideo(videoParams);
        this.emit("setup", status);
        return status;
    };

    /**
     * Start pipeline.
     *
     * Pipeline can be started only after successful init and setup.
     */
    start = async () => {
        await this.video.start();
        this.loopState = true;
        this.emit("start");
        this.enqueue();
    };

    /**
     * Pause pipeline.
     *
     * Nothing happens if pipeline is not started yet.
     */
    pause = () => {
        this.loopState = false;
        // await new Promise<void>((resolve) => {
        //     const interval = setInterval(() => {
        //         if (this.loopId === undefined) {
        //             clearInterval(interval);
        //             return resolve();
        //         }
        //     }, 10);
        // });
        if (this.loopId) {
            window.cancelAnimationFrame(this.loopId);
            delete this.loopId;
        }
        this.video.pause();
        this.emit("pause");
    };

    /**
     * Reset pipeline
     *
     * Stops pipeline, resets video capture and processor.
     * After reset one needs to reinitialize video capture
     * calling setup() before pipeline can be started again.
     */
    reset = () => {
        this.pause();
        this.video.reset();
        delete this.streamCanvas;
        delete this.processCanvas;
        this.processor.reset();
    };

    /**
     * Attach Renderer to the engine
     *
     * @param renderer - Object to be attached
     */
    async addRenderer (renderer: Renderer<ResultT>) {
        this.renderers.push(renderer);
        await renderer.load();
        renderer.setupVideo(
            this.video.size(),
            this.video.ratio());
        renderer.setupCamera(
            this.processor.cameraRatio,
            this.processor.cameraAngle);
    }

    /**
     * Remove attached Renderer
     *
     * @param renderer - Renderer to be removed
     */
    removeRenderer (renderer: Renderer<ResultT>) {
        const { renderers } = this;
        const i = renderers.indexOf(renderer);
        if (i < 0) { return; }
        renderers[i].dispose();
        renderers.slice(i, 1);
    }

    /** Iterate */
    protected iterate = async () => {
        // On every event loop engine captures the next video
        // frame and passes it to the processor for evaluation.
        // Results of processing are further passed to the update()
        // of each attached renderer to be reflected in a scene.
        // Capture image
        const { video, streamCanvas, processCanvas } = this;
        if (!video.capture() || (streamCanvas == null) || (processCanvas == null)) { this.enqueue(); return; }
        if (this.resizeEnabled) { this.resizeBuffer?.capture(video.buffer.canvas); }
        // Process and render
        const result = await this.processor.process(
            processCanvas, video.captureTime);
        (result != null) && await Promise.all(this.renderers.map(
            async (r) => { await r.update(result, streamCanvas); }));
        this.enqueue();
    };

    /** Enqueue the next iteration */
    protected enqueue () {
        // Enqueue the next iteration of the event loop
        this.loopId = this.loopState
            ? window.requestAnimationFrame(this.iterate)
            : undefined;
    }

    /** Setup processor */
    protected async setupProcessor (procParams: ParamsT) {
        const size = (this.resizeEnabled &&
            ((this.resizeBuffer?.size) != null)) || this.video.size();
        return await this.processor.init(
            procParams, size, this.video.ratio());
    }

    /** Setup video capture */
    protected async setupVideo (videoParams?: VideoSourceParams) {
        this.video.reset();
        if (!await this.video.setup(videoParams)) { return false; }
        this.setupSize(this.video.size());
        return true;
    }

    /** Setup video size */
    protected async setupSize (size: Size) {
        // Rescaling if required
        const { width, height } = size;
        this.videoRatio = width / height;
        const maxSize = Math.max(width, height);
        const maxReq = this.engineParams?.max || this.processor.optimalSize;
        this.resizeEnabled = false;
        if (maxReq < maxSize) {
            this.resizeEnabled = true;
            const factor = maxSize / maxReq;
            if (this.resizeBuffer == null) { this.resizeBuffer = new ImageBuffer("resize"); }
            this.resizeBuffer.setSize({
                width: width / factor,
                height: height / factor
            });
        }
        // Select streams
        if (this.resizeEnabled && (this.resizeBuffer != null)) {
            this.processCanvas = this.resizeBuffer.canvas;
            this.processSize = this.resizeBuffer.size;
        } else {
            this.processCanvas = this.video.buffer.canvas;
            this.processSize = this.video.size();
        }
        if (this.engineParams?.orig !== false) {
            this.streamCanvas = this.video.buffer.canvas;
            this.streamSize = this.video.size();
        } else {
            this.streamCanvas = this.processCanvas;
            this.streamSize = this.streamSize;
        }
    }

    /**
     * Callback called when video resolution is changed
     *
     * @param size - Size of the video
     */
    protected resizeVideo (size: Size) {
        this.setupSize(size);
        this.processor.setupVideo(this.processSize, this.videoRatio);
        this.renderers.forEach((r) => {
            r.setupVideo(
                this.streamSize, this.videoRatio);
        });
        this.renderers.forEach((r) => {
            r.setupCamera(
                this.processor.cameraRatio, this.processor.cameraAngle);
        });
    }
}
