import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Layer } from "@babylonjs/core/Layers/layer";
import { BaseTexture } from "@babylonjs/core/Materials/Textures/baseTexture";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { SceneRenderer, CanvasRenderer, type CanvasMode, type Size } from "@geenee/armature";
import { type PoseResult, type FaceResult } from "@geenee/bodyprocessors";

/**
 * Generic babylon.js renderer
 *
 * Extends {@link @geenee/armature!SceneRenderer} for the babylon.js
 * rendering engine. BabylonUniRenderer requires only one layer of
 * {@link @geenee/armature!ResponsiveCanvas} and renders processed
 * video stream as scene's background. Thus WebGL context is shared
 * between Babylon engine and {@link @geenee/armature!ShaderRenderer}.
 * This provides perfect synchronization between video and 3D content.
 * BabylonUniRenderer does basic initialization of engine, scene, and
 * camera instances. It is a generic class that should be further
 * parameterized by type of processing results to build an app using
 * particular implementation of {@link @geenee/armature!Processor}.
 *
 * @typeParam ResultT - Type of processing results
 */
export class BabylonUniRenderer<ResultT extends {} = {}>
    extends SceneRenderer<ResultT, Scene> {
    /** Rendering engine */
    protected renderer: Engine;
    /** Video layer */
    protected layer: Layer;
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
        super({ container, mode, layerCount: 1, mirror });
        // Renderer
        const canvas = this.canvas.layers[0];
        this.renderer = new Engine(canvas, true,
            {
                alpha: true,
                preserveDrawingBuffer: true,
                deterministicLockstep: true,
                lockstepMaxSteps: 4
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
        // Scene, camera and background video layer
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
        this.layer = new Layer("video", null, this.scene, true);
    }

    /**
     * Update the video layer
     *
     * Renders processed frame to texture of video layer.
     *
     * @param stream - Captured video frame
     * @override
     */
    protected updateVideo (stream: HTMLCanvasElement) {
        // Render processed input
        if ((this.current == null) || (this.shader == null)) { return; }
        this.shader.process([this.current], { flip: [1.0] });
        // Update the background video layer
        const texture = this.shader.output?.texture();
        if (texture != null) {
            this.layer.texture = new BaseTexture(
                this.renderer, this.renderer.wrapWebGLTexture(texture));
        }
        // @ts-ignore
        CanvasRenderer.prototype.updateVideo.call(this, stream);
    }

    /**
     * Update and render the scene
     *
     * Virtual method updating and rendering 3D scene.
     * For ajs engine calls `this.scene.render()`.
     *
     * @override
     */
    protected updateScene () {
        // Render the scene
        this.scene?.render();
    }

    /**
     * Dispose renderer object
     *
     * Extended to dispose scene and engine.
     *
     * @override
     */
    dispose () {
        // Dispose scene and engine
        this.layer.dispose();
        this.camera.dispose();
        this.scene?.dispose();
        this.renderer.dispose();
        super.dispose();
    }

    /**
     * Set video parameters
     *
     * Resizes video texture and rendering shader.
     *
     * @param size - Resolution of input video
     * @param ratio - Aspect ration of input video
     * @override
     */
    setupVideo (size: Size, ratio?: number) {
        CanvasRenderer.prototype.setupVideo.call(this, size, ratio);
        const { width, height } = this.videoSize;
        this.input?.resize({ width, height });
        this.shader?.resize({ width, height });
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
 * Abstract renderer for {@link @geenee/bodyprocessors!PoseProcessor}
 *
 * Specializes {@link BabylonUniRenderer} generic for
 * {@link @geenee/bodyprocessors!PoseResult}.This is
 * abstract renderer that doesn't implement any logic.
 */
export class PoseRenderer extends BabylonUniRenderer<PoseResult> { }

/**
 * Abstract renderer for {@link @geenee/bodyprocessors!FaceProcessor}
 *
 * Specializes {@link BabylonUniRenderer} generic for
 * {@link @geenee/bodyprocessors!FaceResult}.This is
 * abstract renderer that doesn't implement any logic.
 */
export class FaceRenderer extends BabylonUniRenderer<FaceResult> { }
