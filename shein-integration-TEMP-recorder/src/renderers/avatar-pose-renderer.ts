// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
import { PoseRenderer, PoseOutfitPlugin, BodypartPatchPlugin }
    from "@geenee/bodyrenderers-babylon";
import { UpperBodyFilter } from "@/plugins/upper-body-filter";
import "@babylonjs/loaders/glTF";
import { type AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import {
    ShadowLight,
    type Scene,
    ShadowGenerator,
    DirectionalLight,
    Vector3,
    SceneLoader,
    PointLight
} from "@babylonjs/core";
import { type CanvasMode } from "@geenee/armature";
import { type SKUKeys, getSKUUrl, getModelNameBySKU } from "@/utils/skuHelper";
import { cancelable } from "@/decorators/cancelable-decorator";
import { sendLogWithCancelableFilter } from "../decorators/cancelable-decorator";
import itemsConfig from "@/itemsConfig.json";
import { setModelParameters } from "@/utils/setModelParameters";

export class AvatarPoseRenderer extends PoseRenderer {
    // Scene
    protected aligner?: PoseOutfitPlugin;
    protected patcher?: BodypartPatchPlugin;
    protected outfit?: AbstractMesh;
    protected shadowers: ShadowGenerator[] = [];
    protected upperBodyFilter?: UpperBodyFilter;
    protected pointLight?: PointLight;
    getModelId = (): SKUKeys | "" => {
        throw new Error("AvatarPoseRednerer getModelId not provided");
    };

    constructor (
        container: HTMLElement,
        mode?: CanvasMode,
        mirror?: boolean) {
        super(container, mode, mirror);

        this.upperBodyFilter = new UpperBodyFilter();
        this.addPlugin(this.upperBodyFilter);
        this.aligner = new PoseOutfitPlugin(
            undefined, { occluders: [/Body/] });
        this.addPlugin(this.aligner);
        this.patcher = new BodypartPatchPlugin();
        this.addPlugin(this.patcher);
        // @TODO: Remove after sdk update
        this.scene?.updateTransformMatrix();
    }

    async load () {
        if (this.loaded || (this.scene == null)) { return; }
        await this.setupScene(this.scene);
        await super.load();
        // this.scene.debugLayer.show();
    }

    async setupScene (scene: Scene) {
        // Lightning
        const directUp = new DirectionalLight(
            "DirectLightUp", new Vector3(0.5, -1, 0), scene);
        directUp.position.set(0, 4, -10);
        directUp.intensity = 5;
        // Shadows
        [directUp].forEach((light) => {
            if (!(light instanceof ShadowLight)) { return; }
            const shadower = new ShadowGenerator(2048, light, true);
            shadower.useBlurCloseExponentialShadowMap = true;
            shadower.blurBoxOffset = 1;
            shadower.bias = 0.0001;
            shadower.normalBias = 0.0001;
            light.autoCalcShadowZBounds = true;
            this.shadowers.push(shadower);
        });
        this.pointLight = new PointLight("SoftLight", Vector3.Zero(), this.scene);
        this.pointLight.intensity = 3;
        await this.loadModel(this.getModelId());
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
        if (this.outfit != null) {
            const outfit = this.outfit;
            this.aligner?.setNode();
            this.patcher?.setParts();
            this.shadowers.forEach((s) => s.removeShadowCaster(outfit));
            this.outfit.dispose(false, true);
            this.scene?.removeMesh(outfit, true);
        }
        this.outfit?.dispose(false, true);

        try {
            const gltf = await this.fetchModel(id, index);
            const outfit = gltf.meshes.find((m) => m.id === "__root__");
            if (outfit == null) { return; }
            gltf.addAllToScene();
            this.outfit = outfit;
            this.aligner?.setNode(outfit);
            const meshes = outfit.getChildMeshes();

            this.patcher?.setParts(meshes.filter((m) => m.name.includes("Outfit")),
                meshes.filter((m) => m.name.includes("Body")));
            outfit.getChildMeshes().forEach((m) => {
                m.receiveShadows = true;
            });
            this.shadowers.forEach((s) => s.addShadowCaster(outfit));

            this.scene.createDefaultEnvironment({ createSkybox: false, createGround: false });
            const hips = this.scene.getTransformNodeByName("Hips");
            if ((hips != null) && (this.pointLight != null)) {
                this.pointLight.parent = hips;
                this.pointLight.position = new Vector3(0.632, 0.860, 1.100);
            }
            setModelParameters(this.scene, id, index);
            return true;
        } catch (e) {
            return sendLogWithCancelableFilter(e);
        }
    }
}
