import { PoseTracker, type PoseDetection, type PosePoint, Box } from "@geenee/bodytracking";
import {
    Processor, Engine, VideoCapture, type VideoSource,
    type ProcParams, type EngineParams, type ImageInput, type Size
} from "@geenee/armature";
export type { PosePoint } from "@geenee/bodytracking";

/** Parameters of {@link PoseProcessor} */
export interface PoseParams extends ProcParams {
    /**
     * Evaluate body segmentation mask
     *
     * Segmentation mask is a monochrome image having the same
     * size as input, where every pixel has value from 0 to 1
     * denoting the probability of it being a foreground pixel.
     */
    mask?: boolean
}

export type PosePoints = { [key in PointName]: PosePoint };
type PointName = typeof PointNames[number];
type PoseMask = NonNullable<PoseDetection["mask"]>;
type PoseDebug = NonNullable<PoseDetection["debug"]>;

/** Pose detection */
export interface Pose {
    /**
     * List of pose {@link PosePoint | keypoints}
     *
     * 2D pixel coordinate - point in the screen coordinate space.
     * XY coordinates are normalized screen coordinates (scaled by
     * image width and height), while the Z coordinate is depth
     * in orthographic projection space, it has the same scale as X.
     * 3D metric coordinate - point within 3D space of perspective
     * camera located at the space origin and pointed in the negative
     * direction of the Z-axis. 3D & 2D points are perfectly aligned.
     */
    points: PosePoints
    /** Reliability score, number between 0 and 1 */
    score: number
    /**
     * Body segmentation mask
     *
     * Segmentation mask is a monochrome image, where every pixel has value
     * from 0 to 1 denoting the probability of it being a foreground pixel.
     * Body mask is provided for normalized rect region of original image.
     * Mask has a fixed size in pixels and should be scaled to image space.
     */
    mask?: PoseMask
    debug?: PoseDebug
}

/** Results of {@link PoseProcessor} */
export interface PoseResult {
    /** Array of detected {@link Pose | poses} */
    poses?: Pose[]
}

/**
 * Pose processor
 *
 * Pose processor estimates 33 2D and 3D pose keypoints, it locates
 * the person / pose region-of-interest (ROI) and predicts the pose
 * keypoints providing smooth, stable and accurate pose estimation.
 * 2D pixel pose keypoints - points in the screen coordinate space.
 * X and Y coordinates are normalized screen coordinates (scaled by
 * width and height of the input image), while the Z coordinate is
 * depth within orthographic projection space, it has the same scale
 * as X coordinate (normalized by image width) and 0 is at the center
 * of hips. These points can be used for 2D pose overlays or when
 * using orthographic projection. Estimation of Z coordinate is not
 * very accurate and we recommend to use only XY for 2D effects.
 * 3D metric points - points within 3D space of perspective camera
 * located at the space origin and pointed in the negative direction
 * of the Z-axis. These points can be used for 3D avatar overlays or
 * virtual try-on. Rigged and skinned models can be rendered on top
 * of the pose aligning skeleton/armature joints with 3D keypoints.
 * 3D and 2D points are perfectly aligned, projections of 3D points
 * coincide with 2D pixel coordinates within the perspective camera.
 */
export class PoseProcessor extends Processor<PoseResult, PoseParams> {
    /** Pose tracker (computation engine) */
    private readonly poseTracker = new PoseTracker();
    /** View angle of perspective camera along smallest side */
    readonly cameraAngleBase = 45 / 180 * Math.PI;

    /** Constructor */
    constructor () {
        super();
        const iOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        this.optimalSize = iOS ? 512 : 1024;
    }

    /**
     * Initialize processor
     *
     * Prepares all resources required for pose estimation.
     *
     * @param params - Processor parameters
     * @param size - Resolution of input video
     * @param ratio - Aspect ration of input video
     * @returns Status of initialization
     * @override
     */
    async init (params: PoseParams, size?: Size, ratio?: number) {
        await this.poseTracker.init(
            params.token, params.root, params.cache, params.mask);
        await this.poseTracker.prepare();
        return await super.init(params, size, ratio);
    }

    /**
     * Reset processor
     *
     * Resets all processing instances to the initial state.
     *
     * @override
     */
    reset () {
        this.poseTracker.reset();
        super.reset();
    }

    /**
     * Dispose processor object
     *
     * Releases resources and instances allocated by processor.
     * Processor object cannot be used after calling dispose().
     *
     * @override
     */
    dispose () {
        this.poseTracker.dispose();
    }

    /**
     * Process the image
     *
     * Pose processor detects pose and predicts pose keypoints.
     *
     * @param input - Image
     * @returns Pose estimation or undefined
     * @override
     */
    async process (input: ImageInput, timestamp?: number):
    Promise<PoseResult | undefined> {
        // return { poses: [] };
        const results = await this.poseTracker.process(input, timestamp);
        const poses = results.map((p) => ({
            points: PointNames.reduce((pose, name, idx) => {
                pose[name] = p.keypoints[idx];
                return pose;
            }, <PosePoints>{}),
            score: p.score,
            mask: p.mask,
            debug: p.debug
        }));
        return { poses };
    }

    /**
     * Set resolution of the input video
     *
     * Defines view angle according to resolution and aspect ratio.
     * Pose processor fixes FoV for more accurate pose alignment.
     *
     * @param size - Resolution of input video
     * @param ratio - Aspect ration of input video
     * @override
     */
    setupVideo (size: Size, ratio?: number) {
        super.setupVideo(size, ratio);
        this.cameraAngle = this.cameraRatio >= 1
            ? this.cameraAngleBase
            : 2.0 * Math.atan(Math.tan(0.5 * this.cameraAngleBase) / this.cameraRatio);
        this.poseTracker.setCamera(this.cameraAngle, this.cameraRatio, 1.0);
        this.poseTracker.reset();
    }
}

/**
 * Pose engine
 *
 * Specialization of {@link @geenee/armature!Engine}
 * for {@link PoseProcessor}. Straightforward wrapper,
 * instead of `new Engine(PoseProcessor, ...)` you can
 * use simpler `const engine = new PoseEngine(...})`.
 */
export class PoseEngine extends Engine<PoseResult, PoseParams, PoseProcessor> {
    /**
     * Constructor
     *
     * @param engineParams - Parameters of the engine
     */
    constructor (
        engineParams?: EngineParams,
        Source: new () => VideoSource = VideoCapture) {
        super(PoseProcessor, engineParams, Source);
    }
}

const PointNames = <const>[
    "nose",
    "eyeInnerL", "eyeL", "eyeOutterL",
    "eyeInnerR", "eyeR", "eyeOutterR",
    "earL", "earR", "mouthL", "mouthR",
    "shoulderL", "shoulderR", "elbowL", "elbowR", "wristL", "wristR",
    "pinkyL", "pinkyR", "indexL", "indexR", "thumbL", "thumbR",
    "hipL", "hipR", "kneeL", "kneeR", "ankleL", "ankleR",
    "heelL", "heelR", "footIndexL", "footIndexR"];
