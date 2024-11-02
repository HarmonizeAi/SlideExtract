import * as fs from "fs";
import cropScreenshots from "./cropper";
import createThumbnail from "./extractScreenshots";
import removeSimilar from "./removeSimilar";

async function main() {
  const input = process.argv[2]; // Get input from command line
  const boundingRectInput = process.argv[3]; // Get bounding box from command line
  const inputName = input.split(".")[0].replace(/ /g, "_");
  const thumbnailDirectory = `zoom_screenshots_${inputName}`;
  const croppedDirectory = `cropped_slides_${inputName}`;
  const uniqueDirectory = `unique_slides_${inputName}`;

  console.log("input", input);

  let boundingRect;
  if (boundingRectInput) {
    const [x, y, width, height] = boundingRectInput.split(",").map(Number);
    boundingRect = { x, y, width, height };
  }

  // Create thumbnails
  await createThumbnail(input, thumbnailDirectory);

  console.log("boundingRect", boundingRect);

  // Crop screenshots only if boundingRect is provided
  if (boundingRect) {

    console.log("go here")
    await cropScreenshots(thumbnailDirectory, croppedDirectory, boundingRect);
    await removeSimilar(croppedDirectory, uniqueDirectory);
  } else {
    console.log("else here");
    await removeSimilar(thumbnailDirectory, uniqueDirectory);
  }

  // Delete the temporary directories
  // await deleteDirectory(thumbnailDirectory);
  // await deleteDirectory(croppedDirectory);
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
