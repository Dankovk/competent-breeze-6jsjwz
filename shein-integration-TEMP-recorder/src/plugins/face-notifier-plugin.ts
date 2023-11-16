import { FacePlugin } from "@geenee/bodyrenderers-babylon";
import { type FaceResult } from "@geenee/bodyprocessors";

export class FaceStateNotifier extends FacePlugin {
    public detection = false;

    constructor (protected onChange: (detected: boolean) => void) {
        super();
    }

    async update (result: FaceResult, stream: HTMLCanvasElement) {
        void (stream);
        const detection = !(result.faces == null) && result.faces.length > 0;
        if (detection !== this.detection) {
            this.detection = detection;
        }
        this.onChange(detection);
    }
}
