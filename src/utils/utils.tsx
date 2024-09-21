interface ImageData {
  width: number;
  height: number;
}

interface PackedImage {
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
  img: HTMLImageElement;
}

export const calculateCoordinates = (
  images: HTMLImageElement[],
  initialPadding: number,
  alignElement: 'bin-packing' | 'top-bottom' | 'left-right'
): PackedImage[] => {
  if (alignElement === 'bin-packing') {
    const sortImages = (
      imagesToSort: HTMLImageElement[]
    ): HTMLImageElement[] => {
      return [...imagesToSort].sort((a, b) => {
        const aPerimeter = 2 * (a.width + a.height);
        const bPerimeter = 2 * (b.width + b.height);
        const aArea = a.width * a.height;
        const bArea = b.width * b.height;
        return bPerimeter * Math.sqrt(bArea) - aPerimeter * Math.sqrt(aArea);
      });
    };

    const sortedImages = sortImages(images);

    class Rectangle {
      constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number
      ) {}
    }

    class Skyline {
      segments: { x: number; y: number; width: number }[];

      constructor(public width: number) {
        this.segments = [{ x: 0, y: 0, width }];
      }

      addRectangle(rect: Rectangle) {
        let index = 0;
        while (index < this.segments.length) {
          const segment = this.segments[index];
          if (segment.x + segment.width > rect.x) {
            if (segment.x >= rect.x + rect.width) {
              break;
            }
            if (segment.y < rect.y + rect.height) {
              if (segment.x < rect.x) {
                this.segments.splice(index, 0, {
                  x: segment.x,
                  y: segment.y,
                  width: rect.x - segment.x,
                });
                index++;
                segment.x = rect.x;
                segment.width -= rect.x - segment.x;
              }
              if (segment.x + segment.width > rect.x + rect.width) {
                this.segments.splice(index + 1, 0, {
                  x: rect.x + rect.width,
                  y: segment.y,
                  width: segment.x + segment.width - (rect.x + rect.width),
                });
                segment.width = rect.x + rect.width - segment.x;
              }
              segment.y = rect.y + rect.height;
            }
          }
          index++;
        }
        this.mergeSegments();
      }

      mergeSegments() {
        let i = 0;
        while (i < this.segments.length - 1) {
          if (this.segments[i].y === this.segments[i + 1].y) {
            this.segments[i].width += this.segments[i + 1].width;
            this.segments.splice(i + 1, 1);
          } else {
            i++;
          }
        }
      }

      findPosition(width: number, height: number): Rectangle | null {
        let bestY = Infinity;
        let bestX = 0;
        for (let i = 0; i < this.segments.length; i++) {
          const { width: segmentWidth, y, x } = this.segments[i];
          if (segmentWidth >= width) {
            if (y < bestY) {
              bestY = y;
              bestX = x;
            }
          }
        }
        return bestY !== Infinity
          ? new Rectangle(bestX, bestY, width, height)
          : null;
      }
    }

    class AdvancedBinPack {
      skyline: Skyline;

      constructor(
        public binWidth: number,
        public binHeight: number,
        public padding: number
      ) {
        this.skyline = new Skyline(binWidth);
      }

      insert(width: number, height: number) {
        const paddedWidth = width + this.padding * 2;
        const paddedHeight = height + this.padding * 2;

        let newNode = this.skyline.findPosition(paddedWidth, paddedHeight);
        if (!newNode) {
          newNode = this.skyline.findPosition(paddedHeight, paddedWidth);
          if (newNode) {
            [newNode.width, newNode.height] = [newNode.height, newNode.width];
          }
        }

        if (newNode) {
          this.skyline.addRectangle(newNode);
          return {
            x: newNode.x + this.padding,
            y: newNode.y + this.padding,
            width: newNode.width - this.padding * 2,
            height: newNode.height - this.padding * 2,
            rotated: newNode.width !== paddedWidth,
          };
        }

        return null;
      }
    }

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
              x: node.x,
              y: node.y,
              width: node.width,
              height: node.height,
              rotated: node.rotated,
              img,
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
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
          rotated: node.rotated,
          img,
        });
      }
    }

    return finalPackedImages;
  }

  if (alignElement === 'top-bottom') {
    return arrangeImages(images, initialPadding, true);
  }

  if (alignElement === 'left-right') {
    return arrangeImages(images, initialPadding);
  }

  return [];
};

function optimizeCanvasSize(packedImages: PackedImage[], padding: number) {
  let maxRight = 0;
  let maxBottom = 0;
  packedImages.forEach(img => {
    maxRight = Math.max(maxRight, img.x + img.width);
    maxBottom = Math.max(maxBottom, img.y + img.height);
  });
  const optimizedWidth = maxRight + padding;
  const optimizedHeight = maxBottom + padding;
  return { width: optimizedWidth, height: optimizedHeight };
}

const arrangeImages = (
  images: HTMLImageElement[],
  initialPadding: number,
  isVertical = false
): PackedImage[] => {
  const sortedImages = [...images].sort(
    (a, b) => b.width * b.height - a.width * a.height
  );

  let offset = initialPadding;
  return sortedImages.map(img => {
    const coord: PackedImage = {
      x: isVertical ? initialPadding : offset,
      y: isVertical ? offset : initialPadding,
      width: img.width,
      height: img.height,
      img,
      rotated: false,
    };
    offset += (isVertical ? img.height : img.width) + initialPadding;
    return coord;
  });
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

export const trimImage = async (
  img: HTMLImageElement
): Promise<HTMLImageElement> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  let left = canvas.width;
  let right = 0;
  let top = canvas.height;
  let bottom = 0;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      if (pixels[index + 3] > 0) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }

  const trimmedWidth = right - left + 1;
  const trimmedHeight = bottom - top + 1;
  const trimmedCanvas = document.createElement('canvas');
  const trimmedCtx = trimmedCanvas.getContext('2d');
  if (!trimmedCtx) throw new Error('Failed to get trimmed canvas context');

  trimmedCanvas.width = trimmedWidth;
  trimmedCanvas.height = trimmedHeight;
  trimmedCtx.drawImage(
    canvas,
    left,
    top,
    trimmedWidth,
    trimmedHeight,
    0,
    0,
    trimmedWidth,
    trimmedHeight
  );

  const trimmedImg = new Image();
  trimmedImg.src = trimmedCanvas.toDataURL();

  return new Promise<HTMLImageElement>(resolve => {
    trimmedImg.onload = () => resolve(trimmedImg);
  });
};

export const handleFiles = async (
  files: File[],
  setFiles: React.Dispatch<React.SetStateAction<File[]>>,
  setCoordinates: (coords: PackedImage[]) => void,
  coordinates: PackedImage[],
  padding: number,
  alignElement: 'bin-packing' | 'top-bottom' | 'left-right'
) => {
  const filesArray = Array.from(files);
  setFiles(prevFiles => [...prevFiles, ...filesArray]);

  const newImages = await Promise.all(
    filesArray.map(
      file =>
        new Promise<HTMLImageElement>(resolve => {
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => trimImage(img).then(resolve);
            img.src = reader.result as string;
          };
          reader.readAsDataURL(file);
        })
    )
  );

  const newCoordinates = calculateCoordinates(newImages, padding, alignElement);
  const updatedCoordinates = coordinates.concat(newCoordinates);

  if (JSON.stringify(updatedCoordinates) !== JSON.stringify(coordinates)) {
    sortAndSetCoordinates(updatedCoordinates, setCoordinates);
  }
};

export const handleDragOverFiles = (event: DragEvent) => {
  event.preventDefault();
};

const processImage = async (
  coord: PackedImage,
  transformCallback: (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    img: HTMLImageElement
  ) => Promise<void>
): Promise<HTMLImageElement> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  canvas.width = coord.img.width;
  canvas.height = coord.img.height;

  await transformCallback(ctx, canvas, coord.img);

  const processedImg = new Image();
  processedImg.src = canvas.toDataURL();

  return new Promise<HTMLImageElement>(resolve => {
    processedImg.onload = () => resolve(processedImg);
  });
};

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
        canvas.width = coord.img.height;
        canvas.height = coord.img.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
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
) => {
  let resizedImage: PackedImage | null = null;

  const updatedCoordinatesPromises = coordinates.map(async coord => {
    if (selectedFiles.has(coord.img)) {
      const resizedImg = await processImage(coord, async (ctx, canvas, img) => {
        canvas.width = coord.width;
        canvas.height = coord.height;
        ctx.drawImage(img, 0, 0, coord.width, coord.height);
        return Promise.resolve();
      });

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
  });

  return Promise.all(updatedCoordinatesPromises).then(newCoordinates => {
    sortAndSetCoordinates(newCoordinates, setCoordinates);
    setSelectedFiles(new Set(selectedFiles));
    return { newCoordinates, resizedImage };
  });
};
