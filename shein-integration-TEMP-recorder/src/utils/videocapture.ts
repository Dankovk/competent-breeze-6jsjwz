import { VideoCapture as VideoCaptureSdk } from "@geenee/armature";

export class VideoCapture extends VideoCaptureSdk {
    private isCaptureBlocked = false;
    constructor () {
        super();
        window.addEventListener("capture-block", () => {
            this.isCaptureBlocked = true;
        });

        window.addEventListener("capture-unblock", () => {
            this.isCaptureBlocked = false;
        });
    }

    capture (): boolean {
        if (!this.isCaptureBlocked) {
            return super.capture();
        } else {
            return true;
        }
    }
}

export const imageProcess = async (src: string): Promise<{ image: HTMLImageElement, width: number, height: number }> => {
    return await new Promise((resolve, reject) => {
        const image = new Image();
        image.src = src;
        image.onerror = reject;
        image.onload = () => {
            resolve({ image, width: image.width, height: image.height });
        };
    });
};

export const normalizeWatermarkDimensions = (watermarkDimensions, canvasDimensions) => {
    const relativeWidth = canvasDimensions.width * 0.2; // 20% of canvas width
    const aspectRatio = watermarkDimensions.height / watermarkDimensions.width;
    const relativeHeight = relativeWidth * aspectRatio;

    return {
        width: relativeWidth,
        height: relativeHeight,
        x: canvasDimensions.width - relativeWidth - (canvasDimensions.width * 0.02), // 2% margin from right
        y: canvasDimensions.height * 0.02 // 2% margin from top
    };
};
