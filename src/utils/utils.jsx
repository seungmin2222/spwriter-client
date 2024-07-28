export const calculateCoordinates = (images, initialPadding, alignElement) => {
  if (alignElement === 'bin-packing') {
    const sortImages = images => {
      return [...images].sort((a, b) => {
        const aRatio = a.width / a.height;
        const bRatio = b.width / b.height;
        const aArea = a.width * a.height;
        const bArea = b.width * b.height;
        return (
          bArea * (1 + Math.abs(1 - bRatio)) -
          aArea * (1 + Math.abs(1 - aRatio))
        );
      });
    };

    const sortedImages = sortImages(images);

    class Rectangle {
      constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
      }
    }

    class AdvancedBinPack {
      constructor(width, height, padding) {
        this.binWidth = width;
        this.binHeight = height;
        this.padding = padding;
        this.usedRectangles = [];
        this.freeRectangles = [new Rectangle(0, 0, width, height)];
      }

      insert(width, height) {
        const paddedWidth = width + this.padding * 2;
        const paddedHeight = height + this.padding * 2;
        let newNode = this.findPositionForNewNodeBestShortSideFit(
          paddedWidth,
          paddedHeight
        );
        if (newNode.height !== 0) {
          newNode.width = width;
          newNode.height = height;
          this.placeRectangle(newNode);
          return newNode;
        }
        return null;
      }

      findPositionForNewNodeBestShortSideFit(width, height) {
        const bestNode = new Rectangle(0, 0, 0, 0);
        let bestShortSideFit = Number.MAX_VALUE;
        let bestLongSideFit = Number.MAX_VALUE;

        for (let i = 0; i < this.freeRectangles.length; ++i) {
          if (
            this.freeRectangles[i].width >= width &&
            this.freeRectangles[i].height >= height
          ) {
            const leftoverHoriz = Math.abs(
              this.freeRectangles[i].width - width
            );
            const leftoverVert = Math.abs(
              this.freeRectangles[i].height - height
            );
            const shortSideFit = Math.min(leftoverHoriz, leftoverVert);
            const longSideFit = Math.max(leftoverHoriz, leftoverVert);

            if (
              shortSideFit < bestShortSideFit ||
              (shortSideFit === bestShortSideFit &&
                longSideFit < bestLongSideFit)
            ) {
              bestNode.x = this.freeRectangles[i].x;
              bestNode.y = this.freeRectangles[i].y;
              bestNode.width = width;
              bestNode.height = height;
              bestShortSideFit = shortSideFit;
              bestLongSideFit = longSideFit;
            }
          }
        }

        return bestNode;
      }

      placeRectangle(node) {
        let numRectanglesToProcess = this.freeRectangles.length;
        for (let i = 0; i < numRectanglesToProcess; i++) {
          if (this.splitFreeNode(this.freeRectangles[i], node)) {
            this.freeRectangles.splice(i, 1);
            --i;
            --numRectanglesToProcess;
          }
        }

        this.pruneFreeList();
        this.usedRectangles.push(node);
      }

      splitFreeNode(freeNode, usedNode) {
        const paddedUsedWidth = usedNode.width + this.padding * 2;
        const paddedUsedHeight = usedNode.height + this.padding * 2;

        if (
          usedNode.x >= freeNode.x + freeNode.width ||
          usedNode.x + paddedUsedWidth <= freeNode.x ||
          usedNode.y >= freeNode.y + freeNode.height ||
          usedNode.y + paddedUsedHeight <= freeNode.y
        )
          return false;

        if (
          usedNode.x < freeNode.x + freeNode.width &&
          usedNode.x + paddedUsedWidth > freeNode.x
        ) {
          if (
            usedNode.y > freeNode.y &&
            usedNode.y < freeNode.y + freeNode.height
          ) {
            const newNode = new Rectangle(
              freeNode.x,
              freeNode.y,
              freeNode.width,
              usedNode.y - freeNode.y
            );
            this.freeRectangles.push(newNode);
          }

          if (usedNode.y + paddedUsedHeight < freeNode.y + freeNode.height) {
            const newNode = new Rectangle(
              freeNode.x,
              usedNode.y + paddedUsedHeight,
              freeNode.width,
              freeNode.y + freeNode.height - (usedNode.y + paddedUsedHeight)
            );
            this.freeRectangles.push(newNode);
          }
        }

        if (
          usedNode.y < freeNode.y + freeNode.height &&
          usedNode.y + paddedUsedHeight > freeNode.y
        ) {
          if (
            usedNode.x > freeNode.x &&
            usedNode.x < freeNode.x + freeNode.width
          ) {
            const newNode = new Rectangle(
              freeNode.x,
              freeNode.y,
              usedNode.x - freeNode.x,
              freeNode.height
            );
            this.freeRectangles.push(newNode);
          }

          if (usedNode.x + paddedUsedWidth < freeNode.x + freeNode.width) {
            const newNode = new Rectangle(
              usedNode.x + paddedUsedWidth,
              freeNode.y,
              freeNode.x + freeNode.width - (usedNode.x + paddedUsedWidth),
              freeNode.height
            );
            this.freeRectangles.push(newNode);
          }
        }

        return true;
      }

      pruneFreeList() {
        for (let i = 0; i < this.freeRectangles.length; ++i)
          for (let j = i + 1; j < this.freeRectangles.length; ++j) {
            if (
              this.isContainedIn(this.freeRectangles[i], this.freeRectangles[j])
            ) {
              this.freeRectangles.splice(i, 1);
              --i;
              break;
            }
            if (
              this.isContainedIn(this.freeRectangles[j], this.freeRectangles[i])
            ) {
              this.freeRectangles.splice(j, 1);
              --j;
            }
          }
      }

      isContainedIn(a, b) {
        return (
          a.x >= b.x &&
          a.y >= b.y &&
          a.x + a.width <= b.x + b.width &&
          a.y + a.height <= b.y + b.height
        );
      }
    }

    const totalArea = sortedImages.reduce(
      (sum, img) =>
        sum +
        (img.width + initialPadding * 2) * (img.height + initialPadding * 2),
      0
    );
    const avgAspectRatio =
      sortedImages.reduce((sum, img) => sum + img.width / img.height, 0) /
      sortedImages.length;
    let binWidth = Math.ceil(Math.sqrt(totalArea * avgAspectRatio));
    let binHeight = Math.ceil(Math.sqrt(totalArea / avgAspectRatio));

    let packer = new AdvancedBinPack(binWidth, binHeight, initialPadding);

    const packedImages = [];
    let allPacked = false;

    while (!allPacked) {
      allPacked = true;
      for (const img of sortedImages) {
        if (!packedImages.some(packed => packed.img === img)) {
          const node = packer.insert(img.width, img.height);
          if (node) {
            packedImages.push({
              x: node.x + initialPadding,
              y: node.y + initialPadding,
              width: img.width,
              height: img.height,
              img,
            });
          } else {
            allPacked = false;
            break;
          }
        }
      }

      if (!allPacked) {
        if (binWidth <= binHeight) {
          binWidth = Math.ceil(binWidth * 1.01);
        } else {
          binHeight = Math.ceil(binHeight * 1.01);
        }
        packer = new AdvancedBinPack(binWidth, binHeight, initialPadding);
        packedImages.length = 0;
      }
    }

    return packedImages;
  } else if (alignElement === 'top-bottom') {
    return arrangeImages(images, initialPadding, true);
  } else if (alignElement === 'left-right') {
    return arrangeImages(images, initialPadding);
  }
};

const arrangeImages = (images, initialPadding, isVertical = false) => {
  const sortedImages = [...images].sort(
    (a, b) => b.width * b.height - a.width * a.height
  );

  let offset = initialPadding;
  return sortedImages.map(img => {
    const coord = {
      x: isVertical ? initialPadding : offset,
      y: isVertical ? offset : initialPadding,
      width: img.width,
      height: img.height,
      img,
    };
    offset += (isVertical ? img.height : img.width) + initialPadding;
    return coord;
  });
};

export const sortAndSetCoordinates = (newCoords, setCoordinates) => {
  const sortedCoordinates = [...newCoords].sort(
    (a, b) => b.width * b.height - a.width * a.height
  );

  setCoordinates(sortedCoordinates);
};

export const trimImage = async img => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
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

  return new Promise(resolve => {
    trimmedImg.onload = () => resolve(trimmedImg);
  });
};

export const handleFiles = async (
  files,
  setFiles,
  setCoordinates,
  coordinates,
  padding,
  alignElement
) => {
  const filesArray = Array.from(files);
  setFiles(prevFiles => [...prevFiles, ...filesArray]);

  const newImages = await Promise.all(
    filesArray.map(
      file =>
        new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => trimImage(img).then(resolve);
            img.src = reader.result;
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

export const handleDragOverFiles = event => {
  event.preventDefault();
};

const processImage = async (coord, transformCallback) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = coord.img.width;
  canvas.height = coord.img.height;

  await transformCallback(ctx, canvas, coord.img);

  const processedImg = new Image();
  processedImg.src = canvas.toDataURL();

  return new Promise(resolve => {
    processedImg.onload = () => resolve(processedImg);
  });
};
export const cloneSelectedImages = (
  coordinates,
  selectedFiles,
  setCoordinates,
  padding,
  alignElement
) => {
  const newCoordinates = [...coordinates];

  const clonePromises = Array.from(selectedFiles).map(img => {
    const index = coordinates.findIndex(coord => coord.img === img);
    if (index !== -1) {
      const coord = coordinates[index];
      const newImg = new Image();
      newImg.src = coord.img.src;

      return new Promise(resolve => {
        newImg.onload = () => {
          newCoordinates.push({
            img: newImg,
            width: coord.width,
            height: coord.height,
            x: 0,
            y: 0,
          });
          resolve(newImg);
        };
      });
    }
  });

  Promise.all(clonePromises).then(newImages => {
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
  coordinates,
  selectedFiles,
  setCoordinates
) => {
  const updatedCoordinatesPromises = coordinates.map(async coord => {
    if (selectedFiles.has(coord.img)) {
      const flippedImg = await processImage(coord, (ctx, canvas) => {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(coord.img, 0, 0);
      });

      const newX = coord.x + coord.width - flippedImg.width;
      const updatedCoord = {
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
  coordinates,
  selectedFiles,
  setCoordinates
) => {
  const updatedCoordinatesPromises = coordinates.map(async coord => {
    if (selectedFiles.has(coord.img)) {
      const rotatedImg = await processImage(coord, (ctx, canvas) => {
        canvas.width = coord.img.height;
        canvas.height = coord.img.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(coord.img, -coord.img.width / 2, -coord.img.height / 2);
      });

      const updatedCoord = {
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
  coordinates,
  selectedFiles,
  setCoordinates,
  setSelectedFiles
) => {
  let resizedImage = null;

  const updatedCoordinatesPromises = coordinates.map(async coord => {
    if (selectedFiles.has(coord.img)) {
      const resizedImg = await processImage(coord, (ctx, canvas) => {
        canvas.width = coord.width;
        canvas.height = coord.height;
        ctx.drawImage(coord.img, 0, 0, coord.width, coord.height);
      });

      const updatedCoord = {
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
