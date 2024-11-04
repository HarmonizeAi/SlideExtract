import * as fs from 'fs';
import chalk from 'chalk';
import path from 'path';
import createThumbnail from './extractScreenshots';
import removeSimilar from './removeSimilar';
import { deleteDirectory, extractFileName } from './utils';

async function processMp4(input: string) {
  const fileName = extractFileName(input);

  if (fs.existsSync(path.join(__dirname, `../out/${fileName}`))) {
    console.log(chalk.yellow('└ Files already exist, skipping\n'));
    return;
  }

  const thumbnailDirectory = path.join(__dirname, `../out/${fileName}/screnshots`);
  // const croppedDirectory = path.join(__dirname, `../out/${fileName}/cropped`);
  const uniqueDirectory = path.join(__dirname, `../out/${fileName}`);

  // const boundingRect = extractRectFromInput(boundingRectInput);

  // Create thumbnails
  console.log(chalk.green('├ Creating thumbnails'));
  await createThumbnail(input, thumbnailDirectory);

  // Crop screenshots only if boundingRect is provided
  // if (boundingRect) {
  //   console.log(chalk.green('>> Cropping screenshots'));
  //   await cropScreenshots(thumbnailDirectory, croppedDirectory, boundingRect);
  //   console.log(chalk.green('>> Removing similar images'));
  //   await removeSimilar(croppedDirectory, uniqueDirectory);
  // } else {
  console.log(chalk.green('├ Removing similar images'));
  await removeSimilar(thumbnailDirectory, uniqueDirectory);
  // }

  // Delete the temporary directories
  await deleteDirectory(thumbnailDirectory);
  // await deleteDirectory(croppedDirectory);

  console.log(chalk.green('└ Done\n'));
}

async function main() {
  const INPUT_FOLDER_NAME = '../in';
  const filesToProcess: string[] = [];

  if (!fs.existsSync(path.join(__dirname, INPUT_FOLDER_NAME))) {
    console.log(chalk.red("Please create './input' folder and place .mp4's there"));
    return;
  }

  fs.readdirSync(path.join(__dirname, INPUT_FOLDER_NAME))
    .filter((file) => file.toLowerCase().endsWith('.mp4'))
    .forEach((file) => {
      filesToProcess.push(file);
    });

  for (const file of filesToProcess) {
    console.log(chalk.blue('\n┌ Processing', file));
    await processMp4(path.join(__dirname, INPUT_FOLDER_NAME, file));
  }
}

main().catch(console.error);
