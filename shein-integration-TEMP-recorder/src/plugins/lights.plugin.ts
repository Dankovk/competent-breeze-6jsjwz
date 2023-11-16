import { BabylonPlugin } from "@geenee/bodyrenderers-babylon";
import { type Scene, HemisphericLight, Vector3, DirectionalLight, Color3, type UniversalCamera } from "@babylonjs/core";

export class LightsPlugin extends BabylonPlugin {
    hemisphericLights: HemisphericLight[];

    constructor (scene: Scene) {
        super();

        this.hemisphericLights = [];
        this.scene = scene;
    }

    dispose () {
        super.dispose();

        this.hemisphericLights = [];
    }

    addLight = (camera: UniversalCamera) => {
        if (this.scene == null) throw new Error("No scene");

        this.hemisphericLights.push(
            new HemisphericLight("HemiLight1", new Vector3(1, 0, 1), this.scene),
            new HemisphericLight("HemiLight2", new Vector3(-1, 0, 1), this.scene)
        );

        this.hemisphericLights[0].intensity = 1;
        this.hemisphericLights[1].intensity = 1;

        const lightLeft = new DirectionalLight("DirectLight1", new Vector3(1, 0, 1), this.scene);
        lightLeft.intensity = 1;
        lightLeft.position = new Vector3(1, 0, 0);
        lightLeft.parent = this.scene.getMeshByName("HeadOccluder");

        const lightRight = new DirectionalLight("DirectLight2", new Vector3(-1, 0, 1), this.scene);
        lightRight.intensity = 1;
        lightRight.position = new Vector3(-1, 0, 0);
        lightRight.parent = this.scene.getMeshByName("HeadOccluder");

        this.scene.registerBeforeRender(function () {
            // lightHead.position = camera.position;
        });
    };
}
