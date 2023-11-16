import { type PoseResult } from "@geenee/bodyprocessors";
import { PosePlugin } from "@geenee/bodyrenderers-babylon";

export class PoseStateNotifier extends PosePlugin {
    public detection = false;

    constructor (protected onChange: (detected: boolean) => void) {
        super();
    }

    async update (result: PoseResult, stream: HTMLCanvasElement) {
        void (stream);
        const detection = !(result.poses == null) && result.poses.length > 0;
        if (detection !== this.detection) {
            this.detection = detection;
        }
        this.onChange(detection);
    }
}
