import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { StdioNull } from "child_process";

const ffmpeg = new FFmpeg();

export class RecorderOfAHealthy {
  ffmpeg = new FFmpeg({ log: true });
  captureCanvas = document.createElement("canvas");
  recording = false;
  file: File | StdioNull = null;

  get frameContext() {
    return this.captureCanvas.getContext("2d");
  }

  async start(stream: MediaStream) {
    this.recording = true;
     this.file = await this.processFrames(stream);


  }

  async stop() {
    this.recording = false;
    return this.file
  }

  convertBitmapToBuffer = async (imageBitmap: ImageBitmap) => {
    try {
      this.captureCanvas.width = imageBitmap.width;
      this.captureCanvas.height = imageBitmap.height;

      this.frameContext?.drawImage(imageBitmap, 0, 0);
      const imageData = this.frameContext?.getImageData(
        0,
        0,
        imageBitmap.width,
        imageBitmap.height,
      );
      return new Uint8Array(imageData?.data?.buffer);
    } catch (e) {
      throw e;
    }
  };

  processFrames = async (stream: MediaStream): Promise<File> => {
    await this.ffmpeg.load();

    const track = stream.getVideoTracks()[0];
    const processor = new ImageCapture(track);

    while (this.recording) {
      const imageBitmap = await processor.grabFrame();
      const buffer = await convertBitmapToBuffer(imageBitmap, hiddenCanvas);
      await ffmpeg.write("frame.raw", buffer);

      // Implement FFmpeg encoding logic here
      // Example: ffmpeg -f rawvideo -pix_fmt rgba -s 640x480 -i frame.raw output.mp4
    }

    //return media file
    return new File();
  };
}

// Function to initialize FFmpeg

// Function to create a new canvas
function createCanvas(width, height, isVisible = false) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  if (!isVisible) {
    canvas.style.display = "none";
  }
  document.body.appendChild(canvas);
  return canvas;
}

// Function to convert ImageBitmap to a buffer
async function convertBitmapToBuffer(imageBitmap, hiddenCanvas) {
  const context = hiddenCanvas.getContext("2d");
  hiddenCanvas.width = imageBitmap.width;
  hiddenCanvas.height = imageBitmap.height;
  context.drawImage(imageBitmap, 0, 0);
  const imageData = context.getImageData(
    0,
    0,
    imageBitmap.width,
    imageBitmap.height,
  );
  return new Uint8Array(imageData.data.buffer);
}

// Main function to process frames

// Creating canvases and starting the frame processing
const visibleCanvas = createCanvas(640, 480, true); // Adjust size as needed
const hiddenCanvas = createCanvas(640, 480); // Same size as visible canvas
const stream = visibleCanvas.captureStream(30);
processFrames(stream, hiddenCanvas);
