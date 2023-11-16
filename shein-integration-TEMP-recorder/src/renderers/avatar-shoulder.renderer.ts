// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
import { type PoseResult } from "@geenee/bodyprocessors";
import "@babylonjs/loaders/glTF";
import { BabylonRenderer } from "./babylonrenderer.renderer";
import { PoseAlignPlugin } from "@geenee/bodyrenderers-babylon";
import { ShortBagPlugin } from "../plugins/shoulder-bag.plugin";
import { type SKUKeys } from "@/utils/skuHelper";
import { AbstractPhysicsPlugin } from "@/types/physics-plugin";
import { CannonPhysics } from "@/plugins/cannon.plugin";
import Havok from "@babylonjs/havok";
import { HavokPhysics } from "@/plugins/havok.plugin";
import { type AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { OcclusionMaterial } from "@babylonjs/core/Materials/Occlusion/occlusionMaterial";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { ShadowOnlyMaterial } from "@babylonjs/materials/shadowOnly";
import { CubeTexture } from "@babylonjs/core";
import { UpperBodyFilter } from "@/plugins/upper-body-filter";
import { getEnvironmentUrl, prependBaseToUrl } from "@/utils/url";

export class AvatarShoulderRenderer extends BabylonRenderer<PoseResult> {
    protected plugin: PoseAlignPlugin;
    protected isDebug = true;
    protected model?: AbstractMesh;
    protected light?: DirectionalLight;
    private physicsPlugin?: AbstractPhysicsPlugin;
    private shadowGenerator?: ShadowGenerator;
    private bagPlugin?: ShortBagPlugin;

    getModelId = (): SKUKeys | "" => {
        throw new Error("AvatarshoulderRednerer getModelId not provided");
    };

    constructor (
        container: HTMLElement,
        mode?: "fit" | "crop" | "pad",
        isDebug?: boolean
    ) {
        super(container, mode, false);
        this.plugin = new PoseAlignPlugin(undefined);
        this.isDebug = isDebug ?? false;

        this.addPlugin(this.plugin);
        this.addPlugin(new UpperBodyFilter());
    }

    // Load assets and setup scene
    async load () {
        if (this.loaded || (this.scene == null)) {
            return;
        }
        await this.setupPhysics();
        this.physicsPlugin?.enable(this.scene, new Vector3(0, -9.8, 0));
        await this.setupScene();
        await this.bagPlugin?.importBagModel();
        // this.setupCustomCamera();
        await super.load();
        this.start();

        const hdrTexture = CubeTexture.CreateFromPrefilteredData(getEnvironmentUrl("city_blender.env"), this.scene);
        this.scene.environmentTexture = hdrTexture;
        hdrTexture.rotationY = 3.26;
        // this.scene.debugLayer.show();
    }

    start () {
        this.renderer.runRenderLoop(() => {
            this.scene?.render();
        });
    }

    setupCustomCamera () {
        this.camera.dispose();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this.camera = new ArcRotateCamera("Camera", 0, 0, 5, new Vector3(0, 0, 0), this.scene);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this.camera.setPosition(new Vector3(0, 0, 1.5));
        this.camera.attachControl(this.canvas.layers[1], true);
        this.camera.minZ = 0;
    }

    async setupPhysics () {
        if (AbstractPhysicsPlugin.isPhysicsLegacy) {
            this.physicsPlugin = new CannonPhysics();
        } else {
            try {
                const hk = await Havok();
                this.physicsPlugin = new HavokPhysics(hk);
            } catch (e) {
                console.error("Setup Physics error: ", e?.toString());
                this.physicsPlugin = new CannonPhysics();
                AbstractPhysicsPlugin.isPhysicsLegacy = true;
            }
        }

        await this.physicsPlugin.setup();
    }

    initBodyShadowOccluder = () => {
        if (this.scene == null) { return; }
        const body = this.scene.getMeshByName("Body");

        this.scene.getMeshByName("hipsimpostor")?.setEnabled(false);
        if (body != null) {
            body.receiveShadows = true;
            const clone = body.clone("cloneBody", null);
            if (clone != null) {
                clone.material = new OcclusionMaterial("occluder-material", this.scene);
                body.material = new ShadowOnlyMaterial("shadow-material", this.scene);
                body.material.alpha = 0.2;
            }
        }

        const hands = this.scene.getMeshByName("Hands");
        if (hands != null) {
            hands.material = new OcclusionMaterial("occluder-hands-material", this.scene);
        }
    };

    initLightShadow = () => {
        if (this.scene == null) {
            return;
        }
        this.light = new DirectionalLight("light", new Vector3(0.2, -0.15, -0.3), this.scene);
        this.light.intensity = 1;
        this.light.position = new Vector3(-0.1, 0, 0.5);
        this.light.shadowMinZ = -2;
        this.light.shadowMaxZ = 3;
        this.light.parent = this.scene.getTransformNodeByName("Hips");
        this.shadowGenerator = new ShadowGenerator(512, this.light);
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.depthScale = 30;
        this.shadowGenerator.useKernelBlur = true;
        this.shadowGenerator.blurKernel = 50;
        // this.canvas.layers[1].style.zIndex = "1"; // for what?
    };

    // Setup scene
    protected setupScene = async () => {
        // this.scene?.debugLayer.show();

        if (this.scene != null) {
            await this.setModel(prependBaseToUrl("models/occluder_separate_hands.glb"));

            this.initBodyShadowOccluder();
            this.initLightShadow();

            if (this.shadowGenerator != null && (this.physicsPlugin != null)) {
                const url = this.getModelId();
                this.bagPlugin = new ShortBagPlugin(this.scene, this.physicsPlugin, this.shadowGenerator, url);
            }
        }
    };

    async setModel (url: string) {
        if (this.model != null) {
            this.scene?.removeMesh(this.model, true);
            this.model.dispose(true, true);
        }

        delete this.model;

        const gltf = await SceneLoader.LoadAssetContainerAsync("", url, this.scene, undefined, ".glb");
        this.model = gltf.meshes.find((m) => m.id === "__root__");
        gltf.addAllToScene();

        this.plugin.setNode(this.model);
    }

    // Hack in order not to render scene two times
    protected updateScene () {
    }

    validatePoseResult (result: PoseResult): boolean {
        if (!result.poses?.length) {
            return false;
        }

        const { shoulderR, elbowR } = result.poses[0].points;

        return shoulderR.score > 0.8 && elbowR.score > 0.5;
    }

    async update (result: PoseResult, stream: HTMLCanvasElement): Promise<void> {
        // this.renderer.beginFrame();
        if (result.poses?.length && !this.bagPlugin?.started) {
            this.bagPlugin?.startPhysics();
        }
        await super.update(result, stream);

        const poseIsValid = this.validatePoseResult(result);

        if (this.bagPlugin?.started && poseIsValid) {
            this.bagPlugin?.setMeshesVisible(true);
        } else {
            this.bagPlugin?.setMeshesVisible(false);
        }
    }
}
