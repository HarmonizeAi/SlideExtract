import * as fs from "fs";
import cropScreenshots from "./cropper";
import createThumbnail, { Rect } from "./extractScreenshots";
import removeSimilar from "./removeSimilar";

function extractRectFromInput(s?: string) {
  if (s == null) return undefined;
  const [x, y, width, height] = s.split(",").map(Number);
  if (x == null || y == null || width == null || height == null)
    return undefined;
  return { x, y, width, height };
}

function extractFileName(filePath: string): string {
  const fileNameWExtension = filePath.split(/[\\/]/).pop() || filePath;
  const fileName = fileNameWExtension.split(".")[0] || fileNameWExtension;
  return fileName.replace(/ /g, "_").replace(/[^\_a-zA-Z0-9]/g, "");
}

async function main() {
  const input = process.argv[2]; // Get input from command line
  const boundingRectInput = process.argv[3]; // Get bounding box from command line

  if (input == null) {
    console.error("Please provide path to the video file");
    return;
  }

  const fileName = extractFileName(input);

  const thumbnailDirectory = `zoom_screenshots_${fileName}`;
  const croppedDirectory = `cropped_slides_${fileName}`;
  const uniqueDirectory = `unique_slides_${fileName}`;

  const boundingRect = extractRectFromInput(boundingRectInput);

  // Create thumbnails
  console.log(">> Creating thumbnails");
  await createThumbnail(input, thumbnailDirectory);

  // Crop screenshots only if boundingRect is provided
  if (boundingRect) {
    console.log(">> Cropping screenshots");
    await cropScreenshots(thumbnailDirectory, croppedDirectory, boundingRect);
    console.log(">> Removing similar images");
    await removeSimilar(croppedDirectory, uniqueDirectory);
  } else {
    console.log(">> Removing similar images");
    await removeSimilar(thumbnailDirectory, uniqueDirectory);
  }

  // Delete the temporary directories
  await deleteDirectory(thumbnailDirectory);
  await deleteDirectory(croppedDirectory);
}

async function deleteDirectory(directory: string) {
  if (fs.existsSync(directory)) {
    fs.rmdirSync(directory, { recursive: true });
    console.log(`Directory ${directory} deleted.`);
  } else {
    console.log(`Directory ${directory} does not exist.`);
  }
}

main().catch(console.error);
