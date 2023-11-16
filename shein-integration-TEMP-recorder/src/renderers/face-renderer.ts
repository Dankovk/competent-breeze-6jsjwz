import { FaceRenderer as FaceRendererGlobal, OccluderPlugin, FaceTrackPlugin } from "@geenee/bodyrenderers-babylon";
import "@babylonjs/loaders/glTF";
import { ShadowOnlyMaterial } from "@babylonjs/materials/shadowOnly";
import { setModelParameters } from "../utils/setModelParameters";
import { getSKUUrl, type SKUKeys } from "@/utils/skuHelper";
import { GlassesShapePlugin } from "@/plugins/glasses-shape-plugin";
import { type TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { type AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { type Scene } from "@babylonjs/core/scene";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { cancelable, sendLogWithCancelableFilter } from "@/decorators/cancelable-decorator";

export class FaceRenderer extends FaceRendererGlobal {
    // Scene
    protected glasses: TransformNode | null = null;
    protected head: AbstractMesh | null = null;
    protected occluderPlugin?: OccluderPlugin;

    protected faceLight: DirectionalLight | null = null;
    protected faceShadowGenerator: ShadowGenerator | null = null;
    protected shadowMesh: AbstractMesh | null = null;
    protected headPlugin?: FaceTrackPlugin;
    getModelId = (): SKUKeys | "" => {
        throw new Error("EarmuffsRednerer getModelId not provided");
    };

    // Load assets and setup scene
    async load () {
        if (this.loaded || (this.scene == null)) { return; }
        await this.setupScene(this.scene);
        await super.load();
    }

    @cancelable
    private async fetchModel (id: SKUKeys, index?: number) {
        return await SceneLoader.LoadAssetContainerAsync("", getSKUUrl(id, index), this.scene);
    };

    loadModel = async (id: SKUKeys | "", index?: number) => {
        if (!id) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!this.scene) return;
        if (this.glasses != null) {
            this.glasses.getChildMeshes().forEach(mesh => {
                mesh.material?.dispose();
            });
            this.glasses.dispose();
        }

        try {
            const hatGltf = await this.fetchModel(id, index);
            hatGltf.addAllToScene();

            this.glasses = this.scene.getTransformNodeByName("NosePoint");
            if (this.glasses != null) {
                this.head = this.scene.getMeshByName("HeadOccluderNose");
                if (this.head != null) {
                    if (this.occluderPlugin != null) {
                        this.removePlugin(this.occluderPlugin);
                    }
                    this.occluderPlugin = new OccluderPlugin(this.head);
                    await this.addPlugin(this.occluderPlugin);
                    const glassesShapePlugin = new GlassesShapePlugin(this.glasses);
                    await this.addPlugin(glassesShapePlugin);

                    if (this.shadowMesh == null) {
                        this.shadowMesh = this.head.clone("shadowMesh", null);
                        if (this.shadowMesh != null) {
                            this.shadowMesh.material = new ShadowOnlyMaterial("mat", this.scene);
                            this.shadowMesh.material.alpha = 0.5;
                            this.shadowMesh.receiveShadows = true;
                        }
                    } else {
                        this.shadowMesh.parent = this.glasses;
                    }
                }

                await this.addPlugin(new FaceTrackPlugin(this.glasses, 168, true));

                setModelParameters(this.scene, id, index);
                const names = ["front_shadow", "side"];
                const meshes = this.scene.meshes.filter(el => names.some(name => el.name.toLowerCase().includes(name)));
                this.faceShadowGenerator?.getShadowMap()?.renderList?.push(...meshes);
            }
            return true;
        } catch (e) {
            sendLogWithCancelableFilter(e);
        }
        return false;
    };

    protected updateScene () {
        super.updateScene();
    }

    // Setup scene
    protected async setupScene (scene: Scene) {
        if (this.scene == null) { return; }
        this.faceLight = new DirectionalLight("light", new Vector3(0, -0.1, -1), this.scene);
        this.faceLight.position = new Vector3(0, 0, 1);
        this.faceLight.autoCalcShadowZBounds = true;

        this.faceShadowGenerator = new ShadowGenerator(512, this.faceLight);

        this.faceShadowGenerator.useContactHardeningShadow = true;
        this.faceShadowGenerator.transparencyShadow = true;
        this.faceShadowGenerator.bias = -0.1;

        this.faceLight.direction.y = -0.15;

        this.faceShadowGenerator.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;

        /* this.faceLight.direction.y = -0.15;
        const light = new DirectionalLight("light", new Vector3(0, -0.1, -1), this.scene);
        light.position = new Vector3(0, 0, -0.5); */
        scene.clearColor = new Color4(0, 0, 0, 0);
        scene.ambientColor = new Color3(1, 1, 1);

        await this.loadModel(this.getModelId());
    }
}
