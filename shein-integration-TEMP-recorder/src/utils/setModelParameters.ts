import { CubeTexture, type Material, type Scene } from "@babylonjs/core";
import itemsConfig from "../itemsConfig.json";
import { type SKUKeys, getModelNameBySKU } from "./skuHelper";
import { getEnvironmentUrl, prependBaseToUrl } from "./url";

export const setModelParameters = (scene: Scene, modelId: SKUKeys | "", index?: number, defaultConfig: Record<string, any> | null = null) => {
    // @ts-ignore
    let config = itemsConfig[getModelNameBySKU(modelId, index)];

    if (!config) {
        if (defaultConfig == null) {
            return;
        }
        config = defaultConfig;
    } else {
        config = { ...defaultConfig, ...config };
    }
    if (config.endEnvironmentName) {
        const hdrTexture = CubeTexture.CreateFromPrefilteredData(getEnvironmentUrl(config.endEnvironmentName), scene);
        scene.environmentTexture = hdrTexture;
    }
    if (scene.environmentTexture != null) {
        // @ts-ignore
        scene.environmentTexture.rotationY = config.endEnvironmentRotation ?? Math.PI + 2.7;
    }
    scene.environmentIntensity = config.endEnvironmentIntensity ?? 1;

    const modelParams = config.modelParams;

    // @ts-ignore
    if (modelParams) {
        const modelMaterial = scene.getMaterialByName(modelParams.modelMaterialName);

        Object.keys(modelParams).forEach(key => {
            if (key !== "modelMaterialName") {
                // @ts-ignore
                modelMaterial[key] = modelParams[key];
            }
        });
    }

    if (config.shadowAlpha) {
        const shadow = scene.getMaterialByName("shadow") as Material;
        if (shadow) {
            shadow.alpha = config.shadowAlpha;
        }
    }

    // @ts-ignore
    const lightParams = config.lightParams;
    if (lightParams) {
        const light = scene.getLightByName("light");
        if (light != null) {
            light.intensity = 1;
        }
        Object.keys(lightParams).forEach(key => {
            // @ts-ignore
            light[key] = lightParams[key];
        });
    }

    if (config.softLightIntensity) {
        const softLight = scene.getLightByName("SoftLight");
        if (softLight != null) {
            softLight.intensity = config.softLightIntensity;
        }
    }
};
