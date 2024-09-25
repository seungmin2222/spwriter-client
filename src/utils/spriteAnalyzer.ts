export default function analyzeSpritesSheet(
  imageData: number[],
  width: number,
  height: number
): { x: number; y: number; width: number; height: number }[] {
  let labels = new Array(width * height).fill(0);
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

  const boundingBoxes = new Map<
    number,
    { minX: number; minY: number; maxX: number; maxY: number }
  >();

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

  const sprites = mergeBoundingBoxes(Array.from(boundingBoxes.values()));

  return sprites;
}

function floodFill(
  imageData: number[],
  width: number,
  height: number,
  startX: number,
  startY: number,
  label: number,
  labels: number[]
): number[] {
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
}

function isTransparent(
  imageData: number[],
  x: number,
  y: number,
  width: number
): boolean {
  const index = (y * width + x) * 4;
  return imageData[index + 3] === 0;
}

function mergeBoundingBoxes(
  boxes: { minX: number; minY: number; maxX: number; maxY: number }[]
): { x: number; y: number; width: number; height: number }[] {
  const merged: { minX: number; minY: number; maxX: number; maxY: number }[] =
    [];

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
}

function isAdjacent(
  box1: { minX: number; minY: number; maxX: number; maxY: number },
  box2: { minX: number; minY: number; maxX: number; maxY: number }
): boolean {
  const gap = 1;
  return !(
    box2.minX > box1.maxX + gap ||
    box2.maxX < box1.minX - gap ||
    box2.minY > box1.maxY + gap ||
    box2.maxY < box1.minY - gap
  );
}

function mergeBoxes(
  box1: { minX: number; minY: number; maxX: number; maxY: number },
  box2: { minX: number; minY: number; maxX: number; maxY: number }
): { minX: number; minY: number; maxX: number; maxY: number } {
  return {
    minX: Math.min(box1.minX, box2.minX),
    minY: Math.min(box1.minY, box2.minY),
    maxX: Math.max(box1.maxX, box2.maxX),
    maxY: Math.max(box1.maxY, box2.maxY),
  };
}
