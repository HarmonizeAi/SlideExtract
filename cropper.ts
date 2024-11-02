import * as fs from "fs";
import * as path from "path";
import cv from "@u4/opencv4nodejs";
import sharp from "sharp";

async function cropScreenshots(inputDirectory: string, outputDirectory: string, boundingRect: { x: number; y: number; width: number; height: number }) {
    
  // Ensure the output directory exists
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }

  // Get a list of all images in the directory
  const images = fs
    .readdirSync(inputDirectory)
    .filter((f) => f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".jpeg"))
    .sort();
   
  // Process each image in the folder
  images.forEach(async (imageName) => {
    const imagePath = path.join(inputDirectory, imageName);
    const originalImage = cv.imread(imagePath);

    // Get image dimensions
    const imageWidth = originalImage.cols;
    const imageHeight = originalImage.rows;

    // Adjust bounding box if it exceeds image dimensions
    if (boundingRect.x + boundingRect.width > imageWidth) {
        boundingRect.x = imageWidth - boundingRect.width; // Right justify
    }
    if (boundingRect.y + boundingRect.height > imageHeight) {
        boundingRect.y = imageHeight - boundingRect.height; // Bottom justify
    }

    // Crop using Sharp
    try {
      const croppedImagePath = path.join(outputDirectory, imageName);
      await sharp(imagePath)
        .extract({
          left: boundingRect.x,
          top: boundingRect.y,
          width: boundingRect.width,
          height: boundingRect.height,
        })
        .toFile(croppedImagePath);

      console.log(`Cropped slide saved to: ${croppedImagePath}`);
    } catch (error) {
      console.error(`Error cropping image ${imageName}:`, error);
    }
  });
}

export default cropScreenshots;
