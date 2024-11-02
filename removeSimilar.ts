import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

async function removeSimilar(inputDirectory: string, outputDirectory: string) {
  const similarityThreshold: number = 1.2;

  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }

  const images: string[] = fs
    .readdirSync(inputDirectory)
    .filter((f: string) => f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".jpeg"))
    .sort();

  const areImagesSimilar = async (
    imagePath1: string,
    imagePath2: string,
    threshold: number
  ): Promise<boolean> => {
    const img1 = await sharp(imagePath1).raw().toBuffer({ resolveWithObject: true });
    const img2 = await sharp(imagePath2).raw().toBuffer({ resolveWithObject: true });

    if (img1.info.width !== img2.info.width || img1.info.height !== img2.info.height) {
      return false;
    }

    const diffPixels = img1.data.reduce((count, pixel, i) => {
      return pixel === img2.data[i] ? count : count + 1;
    }, 0);

    const totalPixels = img1.info.width * img1.info.height;
    const differenceRatio = diffPixels / totalPixels;

    if (differenceRatio > threshold) {
      console.log(`Difference ratio: ${differenceRatio}`);
    }

    return differenceRatio < threshold;
  };

  const filterUniqueImages = async () => {
    const uniqueImages: string[] = [images[0]];

    for (let i = 1; i < images.length; i++) {
      const currentImagePath: string = path.join(inputDirectory, images[i]);
      const previousImagePath: string = path.join(inputDirectory, images[i - 1]);
      
      const similar: boolean = await areImagesSimilar(
        currentImagePath,
        previousImagePath,
        similarityThreshold
      );

      if (!similar) {
        uniqueImages.push(images[i]);
      }
    }

    console.log("uniqueImages", uniqueImages.length);

    uniqueImages.forEach((imageName) => {
      const sourcePath: string = path.join(inputDirectory, imageName);
      const destinationPath: string = path.join(outputDirectory, imageName);
      fs.copyFileSync(sourcePath, destinationPath);
      console.log(`Saved unique image: ${destinationPath}`);
    });

    console.log(`Filtering complete. Unique images saved to ${outputDirectory}`);
  };

  filterUniqueImages().catch((err) => console.error(err));
}

export default removeSimilar;
