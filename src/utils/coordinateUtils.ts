import { PackedImage } from './types';

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

export const optimizeCanvasSize = (
  packedImages: PackedImage[],
  padding: number
) => {
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

export const arrangeImages = (
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
