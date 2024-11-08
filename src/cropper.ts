import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

async function cropScreenshots(inputDir: string, outputDir: string, boundingRect: Rect) {
  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get a list of all images in the directory
  const images = fs
    .readdirSync(inputDir)
    .filter((f) => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'))
    .sort();

  // Process each image in the folder
  for (const imageName of images) {
    const imagePath = path.join(inputDir, imageName);

    try {
      // Get image dimensions using sharp
      const metadata = await sharp(imagePath).metadata();
      const imageWidth = metadata.width || 0;
      const imageHeight = metadata.height || 0;

      // Adjust bounding box if it exceeds image dimensions
      let adjustedX = boundingRect.x;
      let adjustedY = boundingRect.y;

      if (adjustedX + boundingRect.width > imageWidth) {
        adjustedX = imageWidth - boundingRect.width; // Right justify
      }
      if (adjustedY + boundingRect.height > imageHeight) {
        adjustedY = imageHeight - boundingRect.height; // Bottom justify
      }

      // Crop using Sharp
      const croppedImagePath = path.join(outputDir, imageName);
      await sharp(imagePath)
        .extract({
          left: adjustedX,
          top: adjustedY,
          width: boundingRect.width,
          height: boundingRect.height,
        })
        .toFile(croppedImagePath);
    } catch (error) {
      console.error(`Error processing image ${imageName}:`, error);
    }
  }
}

export default cropScreenshots;
