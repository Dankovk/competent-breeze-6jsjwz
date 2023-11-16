import { type PoseResult } from "@geenee/bodyprocessors";
import { PosePlugin } from "@geenee/bodyrenderers-babylon";

export class UpperBodyFilter extends PosePlugin {
    async update (result: PoseResult, stream: HTMLCanvasElement) {
        // Filter upper body poses
        void stream;
        if (!this.loaded) { return; }
        result.poses = result.poses?.filter((pose) => {
            const { points } = pose;
            const anchors = [points.hipL, points.hipR, points.nose].map((p) => p.pixel);
            const xs = anchors.map((p) => p[0]);
            const ys = anchors.map((p) => p[1]);
            const xmin = Math.min(...xs);
            const xmax = Math.max(...xs);
            const ymin = Math.min(...ys);
            const ymax = Math.max(...ys);
            return xmin > 0.1 && xmax < 0.9 && ymin > 0 && ymax < 0.9;
        });
    }
}
