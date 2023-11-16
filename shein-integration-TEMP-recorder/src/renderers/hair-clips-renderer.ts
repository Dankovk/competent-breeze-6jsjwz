import { FaceRenderer, HeadTrackPlugin, OccluderPlugin } from "@geenee/bodyrenderers-babylon";
import "@babylonjs/loaders/glTF";
import { setModelParameters } from "../utils/setModelParameters";
import { getModelNameBySKU, getSKUUrl, type SKUKeys } from "@/utils/skuHelper";
import { type TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { addClipsDragBehaviour } from "@/utils/add-drag-behaviour";
import itemsConfig from "../itemsConfig.json";
import { type Material } from "@babylonjs/core";
import { cancelable, sendLogWithCancelableFilter } from "@/decorators/cancelable-decorator";

const HAIRCLIPS_LOCAL_KEY = "hairclips";

export class HairclipsRenderer extends FaceRenderer {
    protected model?: TransformNode;
    protected root?: TransformNode;
    protected head?: TransformNode;

    protected headTrackPlugin?: HeadTrackPlugin | null = null;
    protected occluderPlugin?: OccluderPlugin = undefined;

    getModelId = (): SKUKeys | "" => {
        throw new Error("HairclipsRenderer getModelId not provided");
    };

    async load () {
        if (this.loaded || (this.scene == null)) { return; }
        await this.setupScene();
        await super.load();
    }

    protected createDragMethod (id: string, index: number) {
        const clips = this.scene?.transformNodes.find(item => item.name.includes("Clips")) ?? undefined;
        if (clips == null) {
            return;
        }

        const sphere = MeshBuilder.CreateSphere("positionSphere", { diameter: 0.15 }, this.scene);
        sphere.material = new StandardMaterial("sphereMat", this.scene);
        sphere.material.alpha = 0;
        sphere.parent = clips.parent;

        const savedPosition = JSON.parse(localStorage.getItem(HAIRCLIPS_LOCAL_KEY + id) ?? "{}");
        if (savedPosition.x !== undefined && savedPosition.y !== undefined && savedPosition.z !== undefined) {
            sphere.position = new Vector3(savedPosition.x, savedPosition.y, savedPosition.z);
        } else {
            sphere.position = new Vector3(0.062, 0.1, 0);
        }
        // @ts-ignore
        const config = itemsConfig[getModelNameBySKU(id, index)];

        addClipsDragBehaviour(sphere, clips, HAIRCLIPS_LOCAL_KEY + id, this.scene, config?.modelDragParams ?? {});
    }

    @cancelable
    private async fetchModel (id: SKUKeys, index?: number) {
        const file = await fetch(getSKUUrl(id, index))
            .then(async (response) => await response.blob())
            .then(async (blob) => new File([blob], "model.glb"));
        return await SceneLoader.LoadAssetContainerAsync("", URL.createObjectURL(file), this.scene, null, ".glb");
    };

    async loadModel (id: SKUKeys | "", index?: number) {
        if (!id || (this.scene == null)) {
            return;
        }
        this.root?.dispose(false, true);

        (this.occluderPlugin != null) && this.removePlugin(this.occluderPlugin);
        (this.headTrackPlugin != null) && this.removePlugin(this.headTrackPlugin);
        try {
            const hatGltf = await this.fetchModel(id, index);
            hatGltf.addAllToScene();

            this.root = this.scene?.getMeshByName("__root__") ?? undefined;
            this.model = this.scene?.getTransformNodeByName("HeadTracking") ?? undefined;
            if (this.model == null) {
                return;
            }

            this.headTrackPlugin = new HeadTrackPlugin(this.model, true);
            await this.addPlugin(this.headTrackPlugin);

            this.head = this.scene?.getMeshByName("HeadOccluder") ?? undefined;
            if (this.head != null) {
                this.occluderPlugin = new OccluderPlugin(this.head);
                await this.addPlugin(this.occluderPlugin);
            }
            this.createDragMethod(id, index ?? 0);

            setModelParameters(this.scene, id, index, {
                endEnvironmentRotation: 2.8,
                endEnvironmentIntensity: 0.85,
                endEnvironmentName: "Light_Pillars_Dark_A_Long_Double.env"
            });

            const shadow = this.scene.getMaterialByName("shadow") as Material;
            if (shadow) {
                shadow.environmentIntensity = 0;
                shadow.alpha = 0.3;
            }
            return true;
        } catch (e) {
            sendLogWithCancelableFilter(e);
        }
        return false;
    }

    // Setup scene
    protected async setupScene () {
        await this.loadModel(this.getModelId());
    }
}
