export const calculateCoordinates = (images, padding, alignElement) => {
  if (alignElement === 'left-right') {
    let xOffset = padding;
    let yOffset = padding;

    return images.map(img => {
      const coord = {
        x: xOffset,
        y: yOffset,
        width: img.width,
        height: img.height,
        img,
      };
      xOffset += img.width + padding;
      return coord;
    });
  } else if (alignElement === 'top-bottom') {
    let xOffset = padding;
    let yOffset = padding;

    return images.map(img => {
      const coord = {
        x: xOffset,
        y: yOffset,
        width: img.width,
        height: img.height,
        img,
      };
      yOffset += img.height + padding;
      return coord;
    });
  } else if (alignElement === 'best-fit') {
    const sortedImages = images.sort(
      (a, b) => b.width * b.height - a.width * a.height
    );

    const coordinates = [];
    const bins = [{ x: padding, y: padding, width: 0, height: 0 }];

    sortedImages.forEach(img => {
      let placed = false;

      for (const bin of bins) {
        if (
          bin.x + img.width + padding <= canvas.width &&
          bin.y + img.height + padding <= canvas.height
        ) {
          coordinates.push({
            x: bin.x,
            y: bin.y,
            width: img.width,
            height: img.height,
            img,
          });
          bin.x += img.width + padding;
          bin.height = Math.max(bin.height, img.height);
          placed = true;
          break;
        }
      }

      if (!placed) {
        const lastBin = bins[bins.length - 1];
        bins.push({
          x: padding,
          y: lastBin.y + lastBin.height + padding,
          width: img.width,
          height: img.height,
        });
        coordinates.push({
          x: padding,
          y: lastBin.y + lastBin.height + padding,
          width: img.width,
          height: img.height,
          img,
        });
      }
    });

    return coordinates;
  }
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

export const handleFiles = (
  files,
  setFiles,
  setCoordinates,
  coordinates,
  padding,
  alignElement
) => {
  const filesArray = Array.from(files);
  setFiles(prevFiles => [...prevFiles, ...filesArray]);

  const newImages = [];
  filesArray.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        trimImage(img).then(trimmedImg => {
          newImages.push(trimmedImg);
          if (newImages.length === filesArray.length) {
            const newCoordinates = calculateCoordinates(
              newImages,
              padding,
              alignElement
            );
            const updatedCoordinates = [...coordinates, ...newCoordinates];
            if (
              JSON.stringify(updatedCoordinates) !== JSON.stringify(coordinates)
            ) {
              sortAndSetCoordinates(updatedCoordinates, setCoordinates);
            }
          }
        });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
};

export const handleDropFiles = (
  event,
  setFiles,
  setCoordinates,
  coordinates,
  padding,
  alignElement
) => {
  event.preventDefault();
  const droppedFiles = Array.from(event.dataTransfer.files);
  handleFiles(
    droppedFiles,
    setFiles,
    setCoordinates,
    coordinates,
    padding,
    alignElement
  );
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
  setCoordinates
) => {
  const newCoordinates = [...coordinates];

  selectedFiles.forEach(img => {
    const index = coordinates.findIndex(coord => coord.img === img);
    if (index !== -1) {
      const coord = coordinates[index];
      const newImg = new Image();
      newImg.src = coord.img.src;

      const imageLoaded = new Promise(resolve => {
        newImg.onload = () => resolve();
      });

      imageLoaded.then(() => {
        newCoordinates.push({
          img: newImg,
          x: coord.x,
          y: coord.y,
          width: coord.width,
          height: coord.height,
        });

        sortAndSetCoordinates(newCoordinates, setCoordinates);
      });
    }
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
  setCoordinates
) => {
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
        x: coord.x,
        y: coord.y,
      };

      return updatedCoord;
    }
    return coord;
  });

  Promise.all(updatedCoordinatesPromises).then(newCoordinates => {
    sortAndSetCoordinates(newCoordinates, setCoordinates);
  });
};
