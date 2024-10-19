import AdvancedBinPack from './AdvancedBinPack';
import { PackedImage } from './types';

const sortImages = (
  images: HTMLImageElement[],
  fileNames: string[]
): { img: HTMLImageElement; fileName: string }[] => {
  const imagesWithFileNames = images.map((img, index) => ({
    img,
    fileName: fileNames[index],
  }));

  return imagesWithFileNames.sort((a, b) => {
    const aPerimeter = 2 * (a.img.width + a.img.height);
    const bPerimeter = 2 * (b.img.width + b.img.height);
    const aArea = a.img.width * a.img.height;
    const bArea = b.img.width * b.img.height;
    return bPerimeter * Math.sqrt(bArea) - aPerimeter * Math.sqrt(aArea);
  });
};

const optimizeCanvasSize = (packedImages: PackedImage[], padding: number) => {
  let maxRight = 0;
  let maxBottom = 0;
  packedImages.forEach(img => {
    maxRight = Math.max(maxRight, img.x + img.width);
    maxBottom = Math.max(maxBottom, img.y + img.height);
  });
  const optimizedWidth = maxRight + padding;
  const optimizedHeight = maxBottom + padding;
  return { width: optimizedWidth, height: optimizedHeight };
};

const arrangeImages = (
  images: HTMLImageElement[],
  fileNames: string[],
  initialPadding: number,
  isVertical = false
): PackedImage[] => {
  const sortedImages = [...images].sort(
    (a, b) => b.width * b.height - a.width * a.height
  );

  let offset = initialPadding;
  return sortedImages.map((img, index) => {
    const coord: PackedImage = {
      img,
      fileName: fileNames[index],
      x: isVertical ? initialPadding : offset,
      y: isVertical ? offset : initialPadding,
      width: img.width,
      height: img.height,
      rotated: false,
    };
    offset += (isVertical ? img.height : img.width) + initialPadding;
    return coord;
  });
};

export const calculateCoordinates = (
  images: HTMLImageElement[],
  fileNames: string[],
  initialPadding: number,
  alignElement: 'bin-packing' | 'top-bottom' | 'left-right'
): PackedImage[] => {
  if (alignElement === 'bin-packing') {
    const sortedImagesWithFileNames = sortImages(images, fileNames);
    const sortedImages: HTMLImageElement[] = [];
    const sortedFileNames: string[] = [];

    sortedImagesWithFileNames.forEach(item => {
      sortedImages.push(item.img);
      sortedFileNames.push(item.fileName);
    });

    const totalArea = sortedImages.reduce(
      (sum, img) =>
        sum +
        (img.width + initialPadding * 2) * (img.height + initialPadding * 2),
      0
    );

    const fixedAspectRatio = 1;
    let binWidth = Math.ceil(Math.sqrt(totalArea * fixedAspectRatio) * 1.3);
    let binHeight = Math.ceil(Math.sqrt(totalArea / fixedAspectRatio));

    let packer = new AdvancedBinPack(binWidth, binHeight, initialPadding);

    const packedImages: PackedImage[] = [];
    let allPacked = false;

    while (!allPacked) {
      allPacked = true;
      for (const img of sortedImages) {
        if (!packedImages.some(packed => packed.img === img)) {
          const node = packer.insert(img.width, img.height);
          if (node) {
            packedImages.push({
              img,
              fileName: sortedFileNames[sortedImages.indexOf(img)],
              x: node.x,
              y: node.y,
              width: node.width,
              height: node.height,
              rotated: node.rotated,
            });
          } else {
            allPacked = false;
            break;
          }
        }
      }

      if (!allPacked) {
        binWidth = Math.ceil(binWidth * 1.2);
        binHeight = Math.ceil(binHeight * 1.2);
        if (binWidth < binHeight * 1.2) {
          binWidth = Math.ceil(binHeight * 1.2);
        }
        packer = new AdvancedBinPack(binWidth, binHeight, initialPadding);
        packedImages.length = 0;
      }
    }

    const optimizedSize = optimizeCanvasSize(packedImages, initialPadding);

    packer = new AdvancedBinPack(
      optimizedSize.width,
      optimizedSize.height,
      initialPadding
    );
    const finalPackedImages: PackedImage[] = [];

    for (const img of sortedImages) {
      const node = packer.insert(img.width, img.height);
      if (node) {
        finalPackedImages.push({
          img,
          fileName: sortedFileNames[sortedImages.indexOf(img)],
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
          rotated: node.rotated,
        });
      }
    }

    return finalPackedImages.map((packedImage, index) => ({
      ...packedImage,
      fileName: sortedFileNames[index],
    }));
  }

  if (alignElement === 'top-bottom') {
    return arrangeImages(images, fileNames, initialPadding, true);
  }

  if (alignElement === 'left-right') {
    return arrangeImages(images, fileNames, initialPadding);
  }

  return [];
};

export const sortAndSetCoordinates = (
  newCoords: PackedImage[],
  setCoordinates: (coords: PackedImage[]) => void
) => {
  const sortedCoordinates = [...newCoords].sort(
    (a, b) => b.width * b.height - a.width * a.height
  );

  setCoordinates(sortedCoordinates);
};
