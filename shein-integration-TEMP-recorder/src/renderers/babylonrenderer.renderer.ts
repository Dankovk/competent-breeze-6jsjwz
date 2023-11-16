import { SceneRenderer, ScenePlugin, type CanvasMode } from "@geenee/armature";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { type PoseResult, type FaceResult } from "@geenee/bodyprocessors";

/**
 * Generic babylon.js renderer
 *
 * Extends {@link @geenee/armature!SceneRenderer} for the babylon.js
 * rendering engine. BabylonRenderer does basic initialization of
 * engine, scene, and camera. It's a generic class that should be
 * parameterized by type of processing results to build an app using
 * particular implementation of {@link @geenee/armature!Processor}.
 *
 * @typeParam ResultT - Type of processing results
 */
export class BabylonRenderer<ResultT extends {} = {}>
    extends SceneRenderer<ResultT, Scene> {
    /** Rendering engine */
    protected renderer: Engine;
    /** Camera instance */
    protected camera: UniversalCamera;
    /** Camera's vertical angle of view */
    protected cameraAngle = 10 / 180 * Math.PI;

    /**
     * Constructor
     *
     * @param container - Container of {@link @geenee/armature!ResponsiveCanvas}
     * @param mode - Fitting mode
     * @param mirror - Mirror the output
     */
    constructor (container: HTMLElement, mode?: CanvasMode, mirror?: boolean) {
        super({ container, mode, layerCount: 2, mirror });
        // Renderer
        const canvas = this.canvas.layers[1];
        this.renderer = new Engine(canvas, true,
            {
                alpha: true,
                preserveDrawingBuffer: true,
                deterministicLockstep: true,
                lockstepMaxSteps: 2
            }, true);
        const pixelRatio = window.devicePixelRatio;
        this.renderer.setSize(
            canvas.clientWidth * pixelRatio,
            canvas.clientHeight * pixelRatio);
        this.canvas.on("resize", () => {
            this.renderer.setSize(
                canvas.clientWidth * pixelRatio,
                canvas.clientHeight * pixelRatio);
        });
        // Scene and camera
        this.scene = new Scene(this.renderer);
        this.scene.useRightHandedSystem = true;
        this.scene.createDefaultEnvironment({ createSkybox: false, createGround: false });
        this.scene.clearColor = new Color4(0, 0, 0, 0);
        this.camera = new UniversalCamera("camera",
            new Vector3(0, 0, 0), this.scene);
        this.camera.rotationQuaternion = new Quaternion(1, 0, 0, 0);
        this.camera.fov = this.cameraAngle;
        this.camera.minZ = 0.02;
        this.camera.maxZ = 20;
    }

    /**
     * Update and render the scene
     *
     * Virtual method updating and rendering 3D scene.
     * For babylon.js engine calls `this.scene.render()`.
     *
     * @override
     */
    protected updateScene () {
        // Render the scene
        this.scene?.render();
    }

    /**
     * Set camera parameters
     *
     * Setups {@link BabylonRenderer#camera} instance according to
     * parameters provided by {@link @geenee/armature!Processor}.
     *
     * @param size - Resolution of input video
     * @param ratio - Aspect ration of input video
     * @override
     */
    setupCamera (ratio: number, angle: number) {
        super.setupCamera(ratio, angle);
        this.camera.fov = this.cameraAngle;
        this.camera.getProjectionMatrix(true);
    }
}

/**
 * Generic plugin for {@link BabylonRenderer}
 *
 * Extends {@link @geenee/armature!ScenePlugin} for babylon.js
 * rendering engine. BabylonPlugin is an abstract generic class
 * simplifying library's API, it doesn't implement any logic and
 * can be used as basis for actual render plugins. It should be
 * parameterized by type of processing results to build a plugin
 * for the implementation of {@link @geenee/armature!Processor}.
 *
 * @typeParam ResultT - Type of processing results
 */
export class BabylonPlugin<ResultT extends {} = {}> extends
    ScenePlugin<ResultT, Scene> { }

/**
 * Abstract renderer for {@link @geenee/bodyprocessors!PoseProcessor}
 *
 * Specializes the {@link BabylonRenderer} generic for
 * {@link @geenee/bodyprocessors!PoseResult}. This is
 * abstract renderer that doesn't implement any logic.
 */
export class PoseRenderer extends BabylonRenderer<PoseResult> { }

/**
 * Abstract plugin for {@link PoseRenderer}
 *
 * Specializes the {@link BabylonPlugin} generic for
 * {@link @geenee/bodyprocessors!PoseResult}. This's
 * abstract plugin that doesn't implement any logic.
 */
export class PosePlugin extends BabylonPlugin<PoseResult> { }

/**
 * Abstract renderer for {@link @geenee/bodyprocessors!FaceProcessor}
 *
 * Specializes the {@link BabylonRenderer} generic for
 * {@link @geenee/bodyprocessors!FaceResult}. This is
 * abstract renderer that doesn't implement any logic.
 */
export class FaceRenderer extends BabylonRenderer<FaceResult> { }

/**
 * Abstract plugin for {@link FaceRenderer}
 *
 * Specializes the {@link BabylonPlugin} generic for
 * {@link @geenee/bodyprocessors!FaceResult}. This's
 * abstract plugin that doesn't implement any logic.
 */
export class FacePlugin extends BabylonPlugin<FaceResult> { }
