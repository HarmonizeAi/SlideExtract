import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execPromise = promisify(exec);

// Helper function to create a thumbnail using ffmpeg
async function createThumbnail(videoPath: string, outputDir: string): Promise<string> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log("*****************");
  console.log("videoPath", videoPath);

  videoPath = videoPath.replace(/ /g, "\\ ");

  const outputPath = path.join(outputDir, `screenshot_%04d.png`);
  await execPromise(`ffmpeg -i ${videoPath} -vf "fps=1/15" ${outputPath}`);
  return outputPath;
}

// Add default export for createThumbnail
export default createThumbnail;

async function main() {
  const videoPath = process.argv[2];
  const outputDir = process.argv[3];
  if (!videoPath) {
    console.error("Please provide a video path as an argument.");
    process.exit(1);
  }
  const thumbnailPath = await createThumbnail(videoPath, outputDir);
  console.log(`Thumbnail created at: ${thumbnailPath}`);
}
