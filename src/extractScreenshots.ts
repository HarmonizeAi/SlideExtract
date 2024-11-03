import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Helper function to create a thumbnail using ffmpeg
export default async function createThumbnail(videoPath: string, outputDir: string): Promise<string> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  videoPath = videoPath.replace(/ /g, '\\ ');

  const outputPath = path.join(outputDir, `screenshot_%04d.png`);
  await execPromise(`ffmpeg -i ${videoPath} -vf "fps=1/15" ${outputPath}`);
  return outputPath;
}
