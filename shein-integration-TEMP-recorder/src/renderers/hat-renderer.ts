/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { FaceRenderer, HeadTrackPlugin, OccluderPlugin } from "@geenee/bodyrenderers-babylon";
import "@babylonjs/loaders/glTF";
import { setModelParameters } from "../utils/setModelParameters";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ShadowOnlyMaterial } from "@babylonjs/materials/shadowOnly";
import { getSKUUrl, type SKUKeys } from "@/utils/skuHelper";
import { type AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { type TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { type Scene } from "@babylonjs/core/scene";
import { cancelable, sendLogWithCancelableFilter } from "@/decorators/cancelable-decorator";

export class HatRenderer extends FaceRenderer {
    protected hat?: TransformNode;
    protected head?: AbstractMesh;

    protected hatPlugin?: HeadTrackPlugin = undefined;
    protected occluderPlugin?: OccluderPlugin = undefined;
    protected faceShadowGenerator?: ShadowGenerator = undefined;
    protected faceLight?: DirectionalLight = undefined;

    protected shadowMesh?: AbstractMesh;

    getModelId = (): SKUKeys | "" => {
        throw new Error("HatRednerer getModelId not provided");
    };

    async load () {
        if (this.loaded || (this.scene == null)) { return; }
        await this.setupScene(this.scene);
        await super.load();
    }

    @cancelable
    private async fetchModel (id: SKUKeys, index?: number) {
        const file = await fetch(getSKUUrl(id, index))
            .then(async (response) => await response.blob())
            .then(async (blob) => new File([blob], "hat.glb"));
        return await SceneLoader.LoadAssetContainerAsync("", URL.createObjectURL(file), this.scene, null, ".glb");
    };

    async loadModel (id: SKUKeys | "", index?: number) {
        if (!id || !this.scene) {
            return;
        }
        this.hat?.dispose(false, true);
        this.occluderPlugin && this.removePlugin(this.occluderPlugin);
        this.hatPlugin && this.removePlugin(this.hatPlugin);
        // @ts-ignore

        try {
            const hatGltf = await this.fetchModel(id, index);
            hatGltf.addAllToScene();

            this.hat = this.scene?.getTransformNodeByName("HeadTracking") ?? undefined;
            if (this.hat === undefined) {
                return;
            }

            this.hatPlugin = new HeadTrackPlugin(this.hat, true);
            this.addPlugin(this.hatPlugin);

            this.head = this.scene?.getMeshByName("HeadOccluder") ?? undefined;
            if (this.head != null) {
                this.occluderPlugin = new OccluderPlugin(this.head);
                this.addPlugin(this.occluderPlugin);
            }
            this.shadowMesh = this.head?.clone("shadowMesh", null) ?? undefined;
            if (!this.shadowMesh || !this.faceLight || !this.faceShadowGenerator) {
                return;
            }
            this.shadowMesh.material = new ShadowOnlyMaterial("mat", this.scene);
            this.shadowMesh.material.alpha = 0.5;
            this.shadowMesh.receiveShadows = true;

            const excludedMeshes = [this.scene.getMeshByName("Hat"), this.scene.getMeshByName("Hat.002")];

            excludedMeshes.length && this.faceLight.excludedMeshes.push(...excludedMeshes);

            const meshWithShadow = this.scene?.getMeshByName("Hat.001");

            if (!meshWithShadow) {
                return;
            }
            this.faceLight.parent = this.hat;
            this.faceShadowGenerator?.getShadowMap()?.renderList?.push(meshWithShadow);
            meshWithShadow.receiveShadows = true;
            setModelParameters(this.scene, id, 0);
            return true;
        } catch (e) {
            sendLogWithCancelableFilter(e);
        }
        return false;
    }

    // Setup scene
    protected async setupScene (scene: Scene) {
        this.faceLight = new DirectionalLight("face_light", new Vector3(-0.2, -0.055, -1), this.scene);
        this.faceLight.position = new Vector3(0, 0, 1);
        this.faceShadowGenerator = new ShadowGenerator(2048, this.faceLight);

        this.faceShadowGenerator.useBlurExponentialShadowMap = true;
        this.faceShadowGenerator.useKernelBlur = true;
        this.faceShadowGenerator.blurKernel = 80;
        this.faceShadowGenerator.blurScale = 4;
        this.faceShadowGenerator.darkness = 0.45;
        this.faceShadowGenerator.depthScale = 60;
        const id = this.getModelId();

        await this.loadModel(id);
    }
}
