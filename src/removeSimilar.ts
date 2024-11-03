import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const SIMILARITY_THRESHHOLD: number = 1.2;

async function _areImagesSimilar(imagePath1: string, imagePath2: string, threshold: number): Promise<boolean> {
  const img1 = await sharp(imagePath1).raw().toBuffer({ resolveWithObject: true });
  const img2 = await sharp(imagePath2).raw().toBuffer({ resolveWithObject: true });

  if (img1.info.width !== img2.info.width || img1.info.height !== img2.info.height) {
    return false;
  }

  const diffPixels = img1.data.reduce((count, pixel, i) => (pixel === img2.data[i] ? count : count + 1), 0);

  const totalPixels = img1.info.width * img1.info.height;
  const differenceRatio = diffPixels / totalPixels;

  return differenceRatio < threshold;
}

const filterUniqueImages = async (inputDir: string, images: string[]): Promise<string[]> => {
  const firstImage = images[0];
  if (firstImage == null) return [];

  const uniqueImages: string[] = [firstImage];

  for (let i = 1; i < images.length; i++) {
    const image = images[i];
    const lastUniqueImage = uniqueImages[uniqueImages.length - 1];
    if (image == null || lastUniqueImage == null) {
      break;
    }

    const similar = await _areImagesSimilar(
      path.join(inputDir, image),
      path.join(inputDir, lastUniqueImage),
      SIMILARITY_THRESHHOLD,
    );

    if (!similar) {
      uniqueImages.push(image);
    }
  }

  return uniqueImages;
};

export default async function removeSimilarOrThrow(inputDir: string, outDir: string) {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const images = fs
    .readdirSync(inputDir)
    .filter((f) => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'))
    .sort();

  const uniqueImages = await filterUniqueImages(inputDir, images);

  uniqueImages.forEach((image) => {
    fs.copyFileSync(path.join(inputDir, image), path.join(outDir, image));
  });
}
