// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
import {
    FaceTrackPlugin,
    HeadTrackPlugin, OccluderPlugin
} from "@geenee/bodyrenderers-babylon";
import "@babylonjs/loaders/glTF";
import {
    type AbstractMesh,
    type HavokPlugin as BabylonHavokPlugin,
    type Nullable
} from "@babylonjs/core";
import { type FaceResult } from "@geenee/bodyprocessors";
import { BabylonUniRenderer } from "./babylon-uni.renderer";
import * as TWEEN from "@tweenjs/tween.js";
import Havok from "@babylonjs/havok";
import { EarringPhysicsPlugin } from "../plugins/earring-physics.plugin";
import { type LightsPlugin } from "../plugins/lights.plugin";
import { type SKUKeys, getSKUUrl } from "@/utils/skuHelper";
import { setModelParameters } from "@/utils/setModelParameters";
import { AbstractPhysicsPlugin } from "@/types/physics-plugin";
import { CannonPhysics } from "@/plugins/cannon.plugin";
import { HavokPhysics } from "@/plugins/havok.plugin";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { type PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { type Scene } from "@babylonjs/core/scene";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { type AssetContainer } from "@babylonjs/core/assetContainer";
import { cancelable, sendLogWithCancelableFilter } from "@/decorators/cancelable-decorator";
import { getEnvironmentUrl } from "@/utils/url";

const LEFT_EAR_LOCAL_KEY = "leftEarDelta";
const RIGHT_EAR_LOCAL_KEY = "rightEarDelta";

function setMaxLinVel (havokPlugin: BabylonHavokPlugin, maxLinVel: number, maxAngVel: number) {
    const heap = havokPlugin._hknp.HEAP8.buffer;
    const world1 = new Int32Array(heap, Number(havokPlugin.world), 100);
    const world2 = new Int32Array(heap, world1[9], 500);
    const mplib = new Int32Array(heap, world2[428], 100);
    const tsbuf = new Float32Array(heap, mplib[8], 300);

    tsbuf[32] = maxLinVel;
    tsbuf[33] = maxAngVel;
    tsbuf[60] = maxLinVel;
    tsbuf[61] = maxAngVel;
    tsbuf[88] = maxLinVel;
    tsbuf[89] = maxAngVel;
    tsbuf[144] = maxLinVel;
    tsbuf[145] = maxAngVel;
    tsbuf[172] = maxLinVel;
    tsbuf[173] = maxAngVel;
    tsbuf[200] = maxLinVel;
    tsbuf[201] = maxAngVel;
    tsbuf[228] = maxLinVel;
    tsbuf[229] = maxAngVel;
}

export class EarringsRenderer extends BabylonUniRenderer<FaceResult> {
    gltf?: AssetContainer;
    root?: Nullable<AbstractMesh>;
    isDebug: boolean;
    protected earringsCreated = false;
    protected faceDetected = false;
    private physicsPlugin?: AbstractPhysicsPlugin;
    protected earringPhysicsPlugin?: EarringPhysicsPlugin;
    protected lightsPlugin?: LightsPlugin;

    constructor (canvas: HTMLElement, mode: "crop" | "fit" | "pad" = "crop", isDebug = false) {
        super(canvas, mode);

        this.isDebug = isDebug;
    }

    getModelId = (): SKUKeys | "" => {
        throw new Error("EarringsRednerer getModelId not provided");
    };

    // Load assets and setup scene
    async load () {
        if (this.loaded || (this.scene == null)) {
            return;
        }

        await this.setupPhysics();
        this.physicsPlugin?.enable(this.scene, new Vector3(0, -9.8, 0));
        await this.setupScene(this.scene);
        await super.load();
        this.start();
        // this.scene.debugLayer.show();
    }

    start () {
        this.renderer.runRenderLoop(() => {
            if (this.scene != null) {
                TWEEN.update();
                this.scene.render();
                this.earringPhysicsPlugin?.updatePhysicsPositions(this.faceDetected);
            }
        });
    }

    async setupPhysics () {
        if (AbstractPhysicsPlugin.isPhysicsLegacy) {
            this.physicsPlugin = new CannonPhysics();
        } else {
            try {
                const hk = await Havok();
                this.physicsPlugin = new HavokPhysics(hk);
                setMaxLinVel(this.physicsPlugin.plugin as BabylonHavokPlugin, 200, 15);
            } catch (e) {
                console.error("Setup Physics error: ", e?.toString());
                this.physicsPlugin = new CannonPhysics();
                AbstractPhysicsPlugin.isPhysicsLegacy = true;
            }
        }

        await this.physicsPlugin.setup();
    }

    setupShadowMaterial = () => {
        if (this.scene == null) return;
        const shadowsMaterial = this.scene.materials.find(item => item.name.includes("LipstickMaterial")) as PBRMaterial;

        if (shadowsMaterial) {
            shadowsMaterial.specularIntensity = 0;
            shadowsMaterial.alpha = 0.2;
        }
    };

    @cancelable
    private async fetchModel (id: SKUKeys, index?: number) {
        return await SceneLoader.LoadAssetContainerAsync("", getSKUUrl(id, index), this.scene, null, ".glb");
    };

    protected async loadModel (id: SKUKeys | "", index?: number) {
        if (!id) {
            return;
        }
        if (this.scene == null) {
            throw new Error("Scene is not initialized");
        }
        this.root?.dispose(false, true);
        this.gltf?.dispose();
        this.scene.materials = [];
        try {
            this.gltf = await this.fetchModel(id, index);
            this.gltf.addAllToScene();
            this.root = this.scene.getMeshByName("__root__");

            await this.initPlugins(id);
            this.setupShadowMaterial();
            this.lightsPlugin?.addLight(this.camera);

            const learShadow = this.scene.getMeshByName("LEarShadow");
            const rearShadow = this.scene.getMeshByName("REarShadow");
            if (learShadow != null) { (learShadow.material as PBRMaterial).environmentIntensity = 0; }
            if (rearShadow != null) { (rearShadow.material as PBRMaterial).environmentIntensity = 0; }

            this.earringPhysicsPlugin?.startEarringPhysics();
            setModelParameters(this.scene, id, index);
            return true;
        } catch (e) {
            sendLogWithCancelableFilter(e);
        }
        return false;
    }

    protected async loadEnvironment () {
        await SceneLoader.LoadAssetContainerAsync("", getEnvironmentUrl("env.glb"), this.scene);
    }

    protected async initPlugins (id: string) {
        if (this.scene == null) {
            return;
        }
        this.earringPhysicsPlugin?.dispose();
        this.lightsPlugin?.dispose();

        if (this.physicsPlugin == null) {
            throw new Error("Physics core plugin is not initialized");
        }
        this.earringPhysicsPlugin = new EarringPhysicsPlugin(this.scene, this.physicsPlugin);
        // this.lightsPlugin = new LightsPlugin(this.scene);

        const leftEarPoint = this.scene?.getTransformNodeByName("LEarPoint");
        if (leftEarPoint != null) {
            await this.earringPhysicsPlugin?.initEar(
                this.scene?.getTransformNodeByName("LEarringPos") ?? null,
                this.scene?.getMeshByName("LEarOccluder") ?? null,
                this.scene?.getTransformNodeByName("LShein") ?? null,
                LEFT_EAR_LOCAL_KEY + id
            );
            await this.addPlugin(new FaceTrackPlugin(leftEarPoint, 127, true));
        }

        const rightEarPoint = this.scene?.getTransformNodeByName("REarPoint");
        if (rightEarPoint != null) {
            await this.earringPhysicsPlugin?.initEar(
                this.scene?.getTransformNodeByName("REarringPos") ?? null,
                this.scene?.getMeshByName("REarOccluder") ?? null,
                this.scene?.getTransformNodeByName("RShein") ?? null,
                RIGHT_EAR_LOCAL_KEY + id
            );
            await this.addPlugin(new FaceTrackPlugin(rightEarPoint, 356, true));
        }

        const headOccluderNode = this.scene?.getMeshByName("HeadOccluder");
        const headTrackingPoint = this.scene?.getTransformNodeByName("HeadTracking");
        if (headOccluderNode != null && headTrackingPoint != null) {
            const headPlugin = new HeadTrackPlugin(headTrackingPoint, false);
            await this.addPlugin(new OccluderPlugin(headOccluderNode));
            await this.addPlugin(headPlugin);
        }
    }

    // Setup scene
    protected async setupScene (scene: Scene) {
        if (this.scene == null) {
            throw new Error("Scene is not initialized");
        }

        if (this.isDebug) {
            await this.scene.debugLayer.show();
        }

        scene.clearColor = new Color4(0, 0, 0, 0);
        scene.ambientColor = new Color3(1, 1, 1);

        await this.loadEnvironment();
        const id = this.getModelId();
        await this.loadModel(id);
    }

    // Override to not render scene in the original render loop
    protected updateScene () {
    }

    async update (result: FaceResult, stream: HTMLCanvasElement): Promise<void> {
        await super.update(result, stream);
        if (result.faces?.length && !this.earringsCreated && (this.earringPhysicsPlugin != null)) {
            // await this.runInitialAnimation();
            this.earringsCreated = true;
            this.faceDetected = true;
        }

        if (!result.faces?.length) {
            this.faceDetected = false;
        } else {
            this.faceDetected = true;
        }
    }

    runInitialAnimation = async () => {
        if (this.scene != null) {
            // @ts-ignore
            const rootGltf = this.scene.getTransformNodeByName("LShein").clone("preview");
            if (rootGltf != null) {
                rootGltf.getChildMeshes().forEach((m) => {
                    if (m.name.includes("box") || m.name.includes("Occluder") || m.name.includes("shadow")) {
                        m.visibility = 0;
                    }
                });
                rootGltf.position.set(0, 0, -0.5);

                const duration = 3000;
                const rotation = new Vector3(0, Math.PI / 6, 0);
                const toRotation = { x: 0, y: 7 * Math.PI / 12, z: 0 };
                const rotationAnimation = new TWEEN.Tween(rotation).to(toRotation, duration).easing(TWEEN.Easing.Quadratic.Out).onUpdate(() => {
                    rootGltf.rotationQuaternion = Quaternion.FromEulerAngles(rotation.x, rotation.y, rotation.z);
                });
                rotationAnimation.start();

                const to = { x: 0, y: 0, z: -0.7 };
                const position = rootGltf.position;
                const positionAnimation = new TWEEN.Tween(position).to(to, 6000).onUpdate(() => {
                    rootGltf.position.set(position.x, position.y, position.z);
                });
                positionAnimation.start();

                rotationAnimation.onComplete(() => {
                    rootGltf.dispose();
                    this.earringPhysicsPlugin?.startEarringPhysics();
                });
            }
        }
    };
}
