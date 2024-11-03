import * as fs from 'fs';
import cropScreenshots, { type Rect } from './cropper';
import createThumbnail from './extractScreenshots';
import removeSimilar from './removeSimilar';
import chalk from 'chalk';
import path from 'path';

function extractRectFromInput(s?: string) {
  if (s == null) return undefined;
  const [x, y, width, height] = s.split(',').map(Number);
  if (x == null || y == null || width == null || height == null) return undefined;
  return { x, y, width, height };
}

function extractFileName(filePath: string): string {
  const fileNameWExtension = filePath.split(/[\\/]/).pop() || filePath;
  const fileName = fileNameWExtension.split('.')[0] || fileNameWExtension;
  return fileName.replace(/ /g, '_').replace(/[^\_a-zA-Z0-9]/g, '');
}

async function main() {
  const input = process.argv[2]; // Get input from command line
  const boundingRectInput = process.argv[3]; // Get bounding box from command line

  if (input == null) {
    console.error('Please provide path to the video file');
    return;
  }

  const fileName = extractFileName(input);

  const thumbnailDirectory = path.join(__dirname, `../out/${fileName}/screnshots`);
  const croppedDirectory = path.join(__dirname, `../out/${fileName}/cropped`);
  const uniqueDirectory = path.join(__dirname, `../out/${fileName}`);

  const boundingRect = extractRectFromInput(boundingRectInput);

  // Create thumbnails
  console.log(chalk.green('>> Creating thumbnails'));
  await createThumbnail(input, thumbnailDirectory);

  // Crop screenshots only if boundingRect is provided
  if (boundingRect) {
    console.log(chalk.green('>> Cropping screenshots'));
    await cropScreenshots(thumbnailDirectory, croppedDirectory, boundingRect);
    console.log(chalk.green('>> Removing similar images'));
    await removeSimilar(croppedDirectory, uniqueDirectory);
  } else {
    console.log(chalk.green('>> Removing similar images'));
    await removeSimilar(thumbnailDirectory, uniqueDirectory);
  }

  // Delete the temporary directories
  await deleteDirectory(thumbnailDirectory);
  await deleteDirectory(croppedDirectory);
}

async function deleteDirectory(directory: string) {
  if (fs.existsSync(directory)) {
    fs.rmSync(directory, { recursive: true });
  }
}

main().catch(console.error);
