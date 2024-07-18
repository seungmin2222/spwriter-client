import React, { useEffect, useRef } from 'react';
import useFileStore from '../../store';

function SpriteEditor() {
  const canvasRef = useRef(null);
  const setCanvasRef = useFileStore(state => state.setCanvasRef);
  const coordinates = useFileStore(state => state.coordinates);
  const padding = useFileStore(state => state.padding);
  const setCoordinates = useFileStore(state => state.setCoordinates);
  const lastClickedIndex = useFileStore(state => state.lastClickedIndex);
  const setLastClickedIndex = useFileStore(state => state.setLastClickedIndex);
  const files = useFileStore(state => state.files);
  const setFiles = useFileStore(state => state.setFiles);

  const createCheckerboardPattern = () => {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 20;
    patternCanvas.height = 20;
    const patternContext = patternCanvas.getContext('2d');

    patternContext.fillStyle = '#ccc';
    patternContext.fillRect(0, 0, 10, 10);
    patternContext.fillRect(10, 10, 10, 10);

    return patternCanvas;
  };

  const drawImages = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalWidth = coordinates.reduce(
      (acc, coord) => acc + coord.width + padding,
      -padding
    );
    const maxHeight =
      Math.max(...coordinates.map(coord => coord.height)) + padding * 2;
    canvas.width = totalWidth;
    canvas.height = maxHeight;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = ctx.createPattern(createCheckerboardPattern(), 'repeat');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let xOffset = 0;
    const updatedCoordinates = coordinates.map((coord, index) => {
      if (coord.img.complete) {
        ctx.drawImage(coord.img, xOffset, padding, coord.width, coord.height);

        if (index === lastClickedIndex) {
          ctx.strokeStyle = 'blue';
          ctx.lineWidth = 1;
          ctx.strokeRect(xOffset, padding, coord.width, coord.height);
        }
        const updatedCoord = { ...coord, x: xOffset, y: padding };
        xOffset += coord.width + padding;
        return updatedCoord;
      }
      return coord;
    });

    if (JSON.stringify(coordinates) !== JSON.stringify(updatedCoordinates)) {
      setCoordinates(updatedCoordinates);
    }
  };

  const handleCanvasClick = event => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let xOffset = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const coord = coordinates[i];
      const startX = xOffset;
      const endX = xOffset + coord.width;
      const startY = padding;
      const endY = padding + coord.height;

      if (x >= startX && x <= endX && y >= startY && y <= endY) {
        setLastClickedIndex(i);
        break;
      }

      xOffset += coord.width + padding;
    }
  };

  const handleDrop = event => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleDragOver = event => {
    event.preventDefault();
  };

  const handleFiles = files => {
    setFiles(prevFiles => [...prevFiles, ...files]);

    const newImages = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          trimImage(img).then(trimmedImg => {
            newImages.push(trimmedImg);
            if (newImages.length === files.length) {
              const newCoordinates = calculateCoordinates(newImages, padding);
              sortAndSetCoordinates([...coordinates, ...newCoordinates]);
            }
          });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const calculateCoordinates = (images, padding) => {
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

  const sortAndSetCoordinates = newCoords => {
    const sortedCoordinates = [...newCoords].sort(
      (a, b) => b.width * b.height - a.width * a.height
    );
    setCoordinates(sortedCoordinates);
  };

  const trimImage = img => {
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

  useEffect(() => {
    setCanvasRef(canvasRef);
  }, [setCanvasRef]);

  useEffect(() => {
    if (canvasRef.current && coordinates.length > 0) {
      drawImages();
    }
  }, [coordinates, padding, lastClickedIndex]);

  return (
    <div
      className="relative w-full h-[80%] overflow-auto bg-[#f0f4f8]"
      data-testid="sprite-editor"
      onClick={handleCanvasClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      role="button"
      tabIndex={0}
      aria-label="Sprite Editor Canvas"
    >
      {files.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <span className="text-[#6b7280] text-xl border rounded-md p-2">
            Drag & Drop files here
          </span>
        </div>
      ) : (
        <canvas ref={canvasRef} className="flex" data-testid="canvas"></canvas>
      )}
    </div>
  );
}

export default SpriteEditor;
