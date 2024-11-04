import * as fs from 'fs';

export function extractRectFromInput(s?: string) {
  if (s == null) return undefined;
  const [x, y, width, height] = s.split(',').map(Number);
  if (x == null || y == null || width == null || height == null) return undefined;
  return { x, y, width, height };
}

export function extractFileName(filePath: string): string {
  const fileNameWExtension = filePath.split(/[\\/]/).pop() || filePath;
  const fileName = fileNameWExtension.split('.')[0] || fileNameWExtension;
  return fileName.replace(/ /g, '_').replace(/[^\_a-zA-Z0-9]/g, '');
}

export async function deleteDirectory(directory: string) {
  if (fs.existsSync(directory)) {
    fs.rmSync(directory, { recursive: true });
  }
}