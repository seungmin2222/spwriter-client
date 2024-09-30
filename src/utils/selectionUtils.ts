import { PackedImage } from './types';
import { processImage } from './imageProcessing';
import { calculateCoordinates, sortAndSetCoordinates } from './coordinateUtils';

export const cloneSelectedImages = (
  coordinates: PackedImage[],
  selectedFiles: Set<HTMLImageElement>,
  setCoordinates: (coords: PackedImage[]) => void,
  padding: number,
  alignElement: 'bin-packing' | 'top-bottom' | 'left-right'
) => {
  const newCoordinates: PackedImage[] = [...coordinates];

  const clonePromises = Array.from(selectedFiles).map(img => {
    const index = coordinates.findIndex(coord => coord.img === img);
    if (index !== -1) {
      const coord = coordinates[index];
      const newImg = new Image();
      newImg.src = coord.img.src;

      return new Promise<HTMLImageElement>(resolve => {
        newImg.onload = () => {
          newCoordinates.push({
            img: newImg,
            width: coord.width,
            height: coord.height,
            x: 0,
            y: 0,
            rotated: false,
          });
          resolve(newImg);
        };
      });
    }
    return Promise.resolve(new Image());
  });

  Promise.all(clonePromises).then(() => {
    const allImages = newCoordinates.map(coord => coord.img);
    const recalculatedCoordinates = calculateCoordinates(
      allImages,
      padding,
      alignElement
    );
    sortAndSetCoordinates(recalculatedCoordinates, setCoordinates);
  });
};

export const inversionSelectedImages = (
  coordinates: PackedImage[],
  selectedFiles: Set<HTMLImageElement>,
  setCoordinates: (coords: PackedImage[]) => void
) => {
  const updatedCoordinatesPromises = coordinates.map(async coord => {
    if (selectedFiles.has(coord.img)) {
      const flippedImg = await processImage(coord, async (ctx, canvas, img) => {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0);
        return Promise.resolve();
      });

      const newX = coord.x + coord.width - flippedImg.width;
      const updatedCoord: PackedImage = {
        ...coord,
        img: flippedImg,
        x: newX,
      };

      selectedFiles.delete(coord.img);
      selectedFiles.add(flippedImg);
      return updatedCoord;
    }
    return coord;
  });

  Promise.all(updatedCoordinatesPromises).then(newCoordinates => {
    sortAndSetCoordinates(newCoordinates, setCoordinates);
  });
};

export const rotateSelectedImages = (
  coordinates: PackedImage[],
  selectedFiles: Set<HTMLImageElement>,
  setCoordinates: (coords: PackedImage[]) => void
) => {
  const updatedCoordinatesPromises = coordinates.map(async coord => {
    if (selectedFiles.has(coord.img)) {
      const rotatedImg = await processImage(coord, async (ctx, canvas, img) => {
        const newCanvas = canvas;
        newCanvas.width = coord.img.height;
        newCanvas.height = coord.img.width;
        ctx.translate(newCanvas.width / 2, newCanvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -coord.img.width / 2, -coord.img.height / 2);
        return Promise.resolve();
      });

      const updatedCoord: PackedImage = {
        ...coord,
        img: rotatedImg,
        width: coord.img.height,
        height: coord.img.width,
        x: coord.x,
        y: coord.y,
      };

      selectedFiles.delete(coord.img);
      selectedFiles.add(rotatedImg);
      return updatedCoord;
    }
    return coord;
  });

  Promise.all(updatedCoordinatesPromises).then(newCoordinates => {
    sortAndSetCoordinates(newCoordinates, setCoordinates);
  });
};

export const resizeSelectedImages = (
  coordinates: PackedImage[],
  selectedFiles: Set<HTMLImageElement>,
  setCoordinates: (coords: PackedImage[]) => void,
  setSelectedFiles: (files: Set<HTMLImageElement>) => void
): Promise<{
  newCoordinates: PackedImage[];
  resizedImage: PackedImage | null;
}> => {
  let resizedImage: PackedImage | null = null;

  const updatedCoordinatesPromises = coordinates.map(
    async (coord: PackedImage) => {
      if (selectedFiles.has(coord.img)) {
        const resizedImg = await processImage(
          coord,
          async (ctx, canvas, img) => {
            const newCanvas = canvas;
            newCanvas.width = coord.width;
            newCanvas.height = coord.height;
            ctx.drawImage(img, 0, 0, coord.width, coord.height);
          }
        );

        const updatedCoord: PackedImage = {
          ...coord,
          img: resizedImg,
          width: coord.width,
          height: coord.height,
        };

        if (
          updatedCoord.width !== coord.img.width ||
          updatedCoord.height !== coord.img.height
        ) {
          resizedImage = updatedCoord;
        }

        selectedFiles.delete(coord.img);
        selectedFiles.add(resizedImg);

        return updatedCoord;
      }
      return coord;
    }
  );

  return Promise.all(updatedCoordinatesPromises).then(newCoordinates => {
    sortAndSetCoordinates(newCoordinates, setCoordinates);
    setSelectedFiles(new Set(selectedFiles));
    return { newCoordinates, resizedImage };
  });
};
