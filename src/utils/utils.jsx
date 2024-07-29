export const calculateCoordinates = (images, initialPadding, alignElement) => {
  if (alignElement === 'bin-packing') {
    const sortImages = images => {
      return [...images].sort((a, b) => {
        const aPerimeter = 2 * (a.width + a.height);
        const bPerimeter = 2 * (b.width + b.height);
        const aArea = a.width * a.height;
        const bArea = b.width * b.height;
        return bPerimeter * Math.sqrt(bArea) - aPerimeter * Math.sqrt(aArea);
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

    class Skyline {
      constructor(width) {
        this.width = width;
        this.segments = [{ x: 0, y: 0, width: width }];
      }

      addRectangle(rect) {
        let index = 0;
        while (index < this.segments.length) {
          const segment = this.segments[index];
          if (segment.x + segment.width <= rect.x) {
            index++;
            continue;
          }
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

      findPosition(width, height) {
        let bestY = Infinity;
        let bestX = 0;
        for (let i = 0; i < this.segments.length; i++) {
          const segment = this.segments[i];
          if (segment.width >= width) {
            const y = segment.y;
            if (y < bestY) {
              bestY = y;
              bestX = segment.x;
            }
          }
        }
        return bestY !== Infinity
          ? new Rectangle(bestX, bestY, width, height)
          : null;
      }
    }

    class AdvancedBinPack {
      constructor(width, height, padding) {
        this.binWidth = width;
        this.binHeight = height;
        this.padding = padding;
        this.skyline = new Skyline(width);
      }

      insert(width, height) {
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
    const aspectRatio =
      sortedImages.reduce((sum, img) => sum + img.width / img.height, 0) /
      sortedImages.length;
    let binWidth = Math.ceil(Math.sqrt(totalArea * aspectRatio));
    let binHeight = Math.ceil(Math.sqrt(totalArea / aspectRatio));

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
        if (binWidth <= binHeight) {
          binWidth = Math.ceil(binWidth * 1.1);
        } else {
          binHeight = Math.ceil(binHeight * 1.1);
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
