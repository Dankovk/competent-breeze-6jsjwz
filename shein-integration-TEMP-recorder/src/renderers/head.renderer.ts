// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { FaceRenderer, HeadTrackPlugin, OccluderPlugin } from "@geenee/bodyrenderers-babylon";
import "@babylonjs/loaders/glTF";
import { setModelParameters } from "../utils/setModelParameters";
import { getSKUUrl, type SKUKeys } from "@/utils/skuHelper";
import { type TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { type Scene } from "@babylonjs/core/scene";
import { type Material } from "@babylonjs/core";
import { cancelable, sendLogWithCancelableFilter } from "@/decorators/cancelable-decorator";

export class HeadRenderer extends FaceRenderer {
    protected model?: TransformNode;
    protected head?: TransformNode;

    protected headTrackPlugin?: HeadTrackPlugin | null = null;
    protected occluderPlugin?: OccluderPlugin = undefined;

    getModelId = (): SKUKeys | "" => {
        throw new Error("HeadRednerer getModelId not provided");
    };

    async load () {
        // this.scene?.debugLayer.show();
        if (this.loaded || (this.scene == null)) { return; }
        await this.setupScene(this.scene);
        await super.load();
    }

    @cancelable
    private async fetchModel (id: SKUKeys, index?: number) {
        const file = await fetch(getSKUUrl(id, index))
            .then(async (response) => await response.blob())
            .then(async (blob) => new File([blob], "model.glb"));
        return await SceneLoader.LoadAssetContainerAsync("", URL.createObjectURL(file), this.scene, null, ".glb");
    };

    async loadModel (id: SKUKeys | "", index?: number) {
        if (!id || !this.scene) {
            return;
        }
        this.model?.dispose(false, true);

        this.occluderPlugin && this.removePlugin(this.occluderPlugin);
        this.headTrackPlugin && this.removePlugin(this.headTrackPlugin);

        try {
            const hatGltf = await this.fetchModel(id, index);
            hatGltf.addAllToScene();

            this.model = this.scene?.getTransformNodeByName("HeadTracking") ?? undefined;
            if (!this.model) {
                return;
            }
            this.headTrackPlugin = new HeadTrackPlugin(this.model, true);
            await this.addPlugin(this.headTrackPlugin);

            this.head = this.scene?.getMeshByName("HeadOccluder") ?? undefined;
            if (this.head) {
                this.occluderPlugin = new OccluderPlugin(this.head);
                await this.addPlugin(this.occluderPlugin);
            }

            const shadow = this.scene.getMaterialByName("shadow") as Material;
            if (shadow) {
                shadow.environmentIntensity = 0;
                shadow.alpha = 0.6;
            }

            setModelParameters(this.scene, id, index);
            return true;
        } catch (e) {
            sendLogWithCancelableFilter(e);
        }
        return false;
    }

    // Setup scene
    protected async setupScene (scene: Scene) {
        await this.loadModel(this.getModelId());
    }
}
