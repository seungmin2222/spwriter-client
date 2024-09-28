interface Position {
  x: number;
  y: number;
}
interface Circle {
  x: number;
  y: number;
  radius: number;
}

interface PackedImage {
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
  circle?: Circle;
}

const createCheckerboardPattern = (): HTMLCanvasElement => {
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = 20;
  patternCanvas.height = 20;
  const patternContext = patternCanvas.getContext('2d');

  if (patternContext) {
    patternContext.fillStyle = '#ccc';
    patternContext.fillRect(0, 0, 10, 10);
    patternContext.fillRect(10, 10, 10, 10);
  }

  return patternCanvas;
};

export const drawSelectionBox = (
  canvas: HTMLCanvasElement | null,
  ctx: CanvasRenderingContext2D | null,
  dragStart: Position,
  dragEnd: Position
) => {
  if (!canvas || !ctx) return;

  const left = Math.min(dragStart.x, dragEnd.x);
  const top = Math.min(dragStart.y, dragEnd.y);
  const width = Math.abs(dragEnd.x - dragStart.x);
  const height = Math.abs(dragEnd.y - dragStart.y);

  ctx.fillStyle = 'rgba(35, 33, 47, 0.3)';
  ctx.fillRect(left, top, width, height);

  ctx.strokeStyle = '#23212f';
  ctx.lineWidth = 2;
  ctx.strokeRect(left, top, width, height);
};

export const drawImages = (
  canvas: HTMLCanvasElement | null,
  coordinates: PackedImage[],
  selectedFiles: Set<HTMLImageElement>,
  padding: number,
  alignElement: string
) => {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const setupCanvas = (width: number, height: number) => {
    const newCanvas = canvas;
    newCanvas.width = width;
    newCanvas.height = height;
    ctx.clearRect(0, 0, newCanvas.width, newCanvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
    ctx.fillStyle = ctx.createPattern(createCheckerboardPattern(), 'repeat')!;
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
  };

  const drawImage = (
    coord: PackedImage,
    xOffset: number = 0,
    yOffset: number = 0
  ) => {
    if (!coord.img.complete) return;
    ctx.drawImage(coord.img, xOffset, yOffset, coord.width, coord.height);
  };

  const drawSelection = (
    coord: PackedImage,
    xOffset: number = 0,
    yOffset: number = 0
  ) => {
    const isSelected = selectedFiles.has(coord.img);
    const newCoord = coord;

    if (!isSelected) {
      newCoord.circle = undefined;
      return;
    }

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.strokeRect(xOffset, yOffset, coord.width, coord.height);

    const circleRadius = 8;
    const circleOffset = -10;
    const circleX = xOffset + coord.width + circleOffset;
    const circleY = yOffset + coord.height + circleOffset;

    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#2b67d1';
    ctx.fill();

    newCoord.circle = { x: circleX, y: circleY, radius: circleRadius };
  };

  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    setupCanvas(canvas.width, canvas.height);
    return;
  }

  if (alignElement === 'left-right') {
    const totalWidth = coordinates.reduce(
      (acc, coord) => acc + coord.width + padding,
      -padding
    );
    const maxHeight =
      Math.max(...coordinates.map(coord => coord.height)) + padding * 2;
    setupCanvas(totalWidth, maxHeight);

    let xOffset = 0;
    coordinates.forEach(coord => {
      drawImage(coord, xOffset, padding);
      drawSelection(coord, xOffset, padding);
      xOffset += coord.width + padding;
    });
  } else if (alignElement === 'top-bottom') {
    const maxWidth =
      Math.max(...coordinates.map(coord => coord.width)) + padding;
    const totalHeight = coordinates.reduce(
      (acc, coord) => acc + coord.height + padding,
      0
    );
    setupCanvas(maxWidth, totalHeight);

    let yOffset = 0;
    coordinates.forEach(coord => {
      const xOffset = padding;
      drawImage(coord, xOffset, yOffset);
      drawSelection(coord, xOffset, yOffset);
      yOffset += coord.height + padding;
    });
  } else if (alignElement === 'bin-packing') {
    const maxWidth =
      Math.max(...coordinates.map(coord => coord.x + coord.width)) + padding;
    const maxHeight =
      Math.max(...coordinates.map(coord => coord.y + coord.height)) + padding;
    setupCanvas(maxWidth, maxHeight);

    coordinates.forEach(coord => {
      drawImage(coord, coord.x, coord.y);
      drawSelection(coord, coord.x, coord.y);
    });
  }
};

export const scrollToResizedImage = (
  resizedCoord: PackedImage,
  canvas: HTMLCanvasElement | null
) => {
  const container = document.querySelector('.sprite-editor');

  if (!container || !canvas) return;

  const containerRect = container.getBoundingClientRect();

  const centerX = resizedCoord.x + resizedCoord.width / 2;
  const centerY = resizedCoord.y + resizedCoord.height / 2;

  let scrollLeft = centerX - containerRect.width / 2;
  let scrollTop = centerY - containerRect.height / 2;

  scrollLeft = Math.max(
    0,
    Math.min(scrollLeft, canvas.width - containerRect.width)
  );
  scrollTop = Math.max(
    0,
    Math.min(scrollTop, canvas.height - containerRect.height)
  );

  container.scrollTo({
    left: scrollLeft,
    top: scrollTop,
    behavior: 'smooth',
  });
};

const isImageInSelectionBox = (
  coord: PackedImage,
  dragStart: Position,
  dragEnd: Position
): boolean => {
  const left = Math.min(dragStart.x, dragEnd.x);
  const right = Math.max(dragStart.x, dragEnd.x);
  const top = Math.min(dragStart.y, dragEnd.y);
  const bottom = Math.max(dragStart.y, dragEnd.y);

  return (
    coord.x < right &&
    coord.x + coord.width > left &&
    coord.y < bottom &&
    coord.y + coord.height > top
  );
};

export const selectImagesInBox = (
  coordinates: PackedImage[],
  selectedFiles: Set<HTMLImageElement>,
  dragStart: Position,
  dragEnd: Position
): Set<HTMLImageElement> => {
  const newSelectedFiles = new Set(selectedFiles);
  coordinates.forEach(coord => {
    if (isImageInSelectionBox(coord, dragStart, dragEnd)) {
      if (newSelectedFiles.has(coord.img)) {
        newSelectedFiles.delete(coord.img);
      } else {
        newSelectedFiles.add(coord.img);
      }
    }
  });
  return newSelectedFiles;
};

export const clearSelectionBox = (
  canvas: HTMLCanvasElement | null,
  coordinates: PackedImage[],
  selectedFiles: Set<HTMLImageElement>,
  padding: number,
  alignElement: string
) => {
  drawImages(canvas, coordinates, selectedFiles, padding, alignElement);
};

export const handleCanvasClick = (
  e: MouseEvent,
  canvas: HTMLCanvasElement | null,
  coordinates: PackedImage[],
  selectedFiles: Set<HTMLImageElement>,
  setSelectedFiles: (selectedFiles: Set<HTMLImageElement>) => void
) => {
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const newSelectedFiles = new Set(selectedFiles);

  coordinates.forEach(coord => {
    const startX = coord.x;
    const endX = coord.x + coord.width;
    const startY = coord.y;
    const endY = coord.y + coord.height;

    if (x >= startX && x <= endX && y >= startY && y <= endY) {
      if (newSelectedFiles.has(coord.img)) {
        newSelectedFiles.delete(coord.img);
      } else {
        newSelectedFiles.add(coord.img);
      }
    }
  });

  setSelectedFiles(newSelectedFiles);
};
