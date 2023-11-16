import { type CanvasRenderer, Snapshoter as SnapshoterSdk } from "@geenee/armature";
import { normalizeWatermarkDimensions } from "@/utils/videocapture";

export class Snapshoter extends SnapshoterSdk {
    private readonly watermarkOptions = {
        width: 0,
        height: 0,
        x: 0,
        y: 0
    };

    constructor (
        renderer: CanvasRenderer,
        mirror?: boolean,
        sizeMode?: "video" | "max" | "min",
        sizeMax?: number | undefined,
        protected watermarkImage?: typeof Image
    ) {
        super(
            renderer,
            mirror,
            sizeMode,
            sizeMax
        );
    }

    async snapshot (): Promise<ImageData | undefined> {
        const image = await super.snapshot();

        if (image == null) {
            throw new Error("Snapshoter failed to take snapshot");
        }

        if (this.watermarkImage == null) {
            return image;
        }

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (context == null) {
            throw new Error("Failed to get canvas context");
        }

        canvas.width = image.width;
        canvas.height = image.height;

        context.putImageData(image, 0, 0);

        const { x, y, width, height } = normalizeWatermarkDimensions(this.watermarkImage, image);
        this.watermarkOptions.x = x;
        this.watermarkOptions.y = y;
        this.watermarkOptions.width = width;
        this.watermarkOptions.height = height;

        context.drawImage(
            this.watermarkImage,
            this.watermarkOptions.x,
            this.watermarkOptions.y,
            this.watermarkOptions.width,
            this.watermarkOptions.height
        );

        return context.getImageData(0, 0, canvas.width, canvas.height);
    }
}
