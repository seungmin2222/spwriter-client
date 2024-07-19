export const calculateCoordinates = (images, padding) => {
  let xOffset = 0;
  return images.map((img, index) => {
    const coord = {
      index: Date.now() + index,
      x: xOffset,
      y: padding,
      width: img.width,
      height: img.height,
      img,
    };
    xOffset += img.width + padding;
    return coord;
  });
};

export const sortAndSetCoordinates = (newCoords, setCoordinates) => {
  const sortedCoordinates = [...newCoords].sort(
    (a, b) => b.width * b.height - a.width * a.height
  );
  setCoordinates(sortedCoordinates);
};

export const trimImage = img => {
  return new Promise(resolve => {
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
    trimmedImg.onload = () => resolve(trimmedImg);
  });
};

export const handleFiles = (
  files,
  setFiles,
  setCoordinates,
  coordinates,
  padding
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
            const newCoordinates = calculateCoordinates(newImages, padding);
            sortAndSetCoordinates(
              [...coordinates, ...newCoordinates],
              setCoordinates
            );
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
  padding
) => {
  event.preventDefault();
  const droppedFiles = Array.from(event.dataTransfer.files);
  handleFiles(droppedFiles, setFiles, setCoordinates, coordinates, padding);
};

export const handleDragOverFiles = event => {
  event.preventDefault();
};
