type BoundingBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

type Sprite = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const analyzeSpritesSheet = (
  imageData: number[],
  width: number,
  height: number
): Sprite[] => {
  let labels: number[] = new Array(width * height).fill(0);
  let nextLabel = 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (
        !isTransparent(imageData, x, y, width) &&
        labels[y * width + x] === 0
      ) {
        labels = floodFill(imageData, width, height, x, y, nextLabel, labels);
        nextLabel++;
      }
    }
  }

  const boundingBoxes = new Map<number, BoundingBox>();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const label = labels[y * width + x];
      if (label !== 0) {
        if (!boundingBoxes.has(label)) {
          boundingBoxes.set(label, { minX: x, minY: y, maxX: x, maxY: y });
        } else {
          const box = boundingBoxes.get(label)!;
          box.minX = Math.min(box.minX, x);
          box.minY = Math.min(box.minY, y);
          box.maxX = Math.max(box.maxX, x);
          box.maxY = Math.max(box.maxY, y);
        }
      }
    }
  }

  const sprites: Sprite[] = mergeBoundingBoxes(
    Array.from(boundingBoxes.values())
  );

  return sprites;
};

const floodFill = (
  imageData: number[],
  width: number,
  height: number,
  startX: number,
  startY: number,
  label: number,
  labels: number[]
): number[] => {
  const newLabels = [...labels];
  const stack = [{ x: startX, y: startY }];

  while (stack.length > 0) {
    const { x, y } = stack.pop()!;
    const index = y * width + x;

    if (
      x >= 0 &&
      x < width &&
      y >= 0 &&
      y < height &&
      newLabels[index] === 0 &&
      !isTransparent(imageData, x, y, width)
    ) {
      newLabels[index] = label;

      stack.push({ x: x + 1, y });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
    }
  }

  return newLabels;
};

const isTransparent = (
  imageData: number[],
  x: number,
  y: number,
  width: number
): boolean => {
  const index = (y * width + x) * 4;
  return imageData[index + 3] === 0;
};

const mergeBoundingBoxes = (boxes: BoundingBox[]): Sprite[] => {
  const merged: BoundingBox[] = [];

  for (const box of boxes) {
    let mergedBox = false;
    for (let i = 0; i < merged.length; i++) {
      if (isAdjacent(merged[i], box)) {
        merged[i] = mergeBoxes(merged[i], box);
        mergedBox = true;
        break;
      }
    }
    if (!mergedBox) {
      merged.push(box);
    }
  }

  return merged.map(box => ({
    x: box.minX,
    y: box.minY,
    width: box.maxX - box.minX + 1,
    height: box.maxY - box.minY + 1,
  }));
};

const isAdjacent = (box1: BoundingBox, box2: BoundingBox): boolean => {
  const gap = 1;
  return !(
    box2.minX > box1.maxX + gap ||
    box2.maxX < box1.minX - gap ||
    box2.minY > box1.maxY + gap ||
    box2.maxY < box1.minY - gap
  );
};

const mergeBoxes = (box1: BoundingBox, box2: BoundingBox): BoundingBox => ({
  minX: Math.min(box1.minX, box2.minX),
  minY: Math.min(box1.minY, box2.minY),
  maxX: Math.max(box1.maxX, box2.maxX),
  maxY: Math.max(box1.maxY, box2.maxY),
});

export default analyzeSpritesSheet;
