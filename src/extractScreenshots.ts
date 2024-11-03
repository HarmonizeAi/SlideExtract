import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

// Helper function to create a thumbnail using ffmpeg
export default async function createThumbnail(videoPath: string, outputDir: string): Promise<string | null> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return new Promise<string | null>((resolve, reject) => {
    ffmpeg(videoPath)
      .output(path.join(outputDir, `screenshot_%04d.png`))
      .outputOptions('-vf', 'fps=1/15')
      .on('end', (data) => resolve(data))
      .on('error', (err) => reject(err))
      .run();
  });
}
