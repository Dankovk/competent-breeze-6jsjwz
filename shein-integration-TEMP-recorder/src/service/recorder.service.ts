import { type CanvasRenderer, Recorder as RecorderSdk } from "@geenee/armature";
import { normalizeWatermarkDimensions } from "@/utils/videocapture";

export class Recorder extends RecorderSdk {
    constructor (
        renderer: CanvasRenderer,
        type?: string,
        mirror?: boolean,
        sizeMode?: "video" | "max" | "min",
        sizeMax?: number,
        bitRate?: number,
        protected watermarkImage?: typeof Image
    ) {
        super(renderer, type, mirror, sizeMode, sizeMax, bitRate);

        this.frame = this.frame.bind(this);
    }

    protected override frame = () => {
        if (this.watermarkImage == null) return;

        const { renderer, context, stream } = this;
        const { width, height } = this.canvas;

        if ((stream == null) || (context == null)) return;

        renderer.canvas.layers.map((layer) => {
            context.drawImage(layer, 0, 0, width, height);
        });

        const { x, y, width: wWidth, height: wHeight } = normalizeWatermarkDimensions(
            this.watermarkImage,
            { width, height }
        );

        context.save();
        context.resetTransform();
        context.drawImage(
            this.watermarkImage,
            x, y,
            wWidth,
            wHeight
        );
        context.restore();

        (stream.getVideoTracks()[0] as any)?.requestFrame();
    };
}
