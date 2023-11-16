import { type TransformNode } from "@babylonjs/core";
import { type FaceResult } from "@geenee/bodyprocessors";
import { BabylonPlugin } from "@geenee/bodyrenderers-babylon";

export class GlassesShapePlugin extends BabylonPlugin<FaceResult> {
    constructor (protected node: TransformNode) {
        super();
    }

    async update (result: FaceResult, stream: HTMLCanvasElement): Promise<void> {
        const scaleX = this.node.scaling.x;
        this.node.scaling.set(scaleX, scaleX, scaleX);
        await super.update(result, stream);
    }
}
