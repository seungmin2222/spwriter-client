import React, { useEffect, useRef } from 'react';
import useFileStore from '../../store';
import { handleFiles } from '../utils/utils';

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

  const drawImages = (timestamp, startTime) => {
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
    const duration = 250;
    const elapsed = Math.min(timestamp - startTime, duration);
    const opacity = elapsed / duration;

    const updatedCoordinates = coordinates.map((coord, index) => {
      if (!coord.img.complete) {
        return coord;
      }
      ctx.drawImage(coord.img, xOffset, padding, coord.width, coord.height);

      if (index === lastClickedIndex) {
        ctx.strokeStyle = `rgba(0, 0, 255, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(xOffset, padding, coord.width, coord.height);
      }
      const updatedCoord = { ...coord, x: xOffset, y: padding };
      xOffset += coord.width + padding;
      return updatedCoord;
    });

    if (JSON.stringify(coordinates) !== JSON.stringify(updatedCoordinates)) {
      setCoordinates(updatedCoordinates);
    }

    if (elapsed < duration) {
      requestAnimationFrame(timestamp => drawImages(timestamp, startTime));
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
        requestAnimationFrame(timestamp => drawImages(timestamp, timestamp));
        break;
      }

      xOffset += coord.width + padding;
    }
  };

  const handleDrop = event => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    handleFiles(droppedFiles, setFiles, setCoordinates, coordinates, padding);
  };

  const handleDragOver = event => {
    event.preventDefault();
  };

  useEffect(() => {
    setCanvasRef(canvasRef);
  }, [setCanvasRef]);

  useEffect(() => {
    if (canvasRef.current && coordinates.length > 0) {
      requestAnimationFrame(timestamp => drawImages(timestamp, timestamp));
    }
  }, [coordinates, padding, lastClickedIndex]);

  return (
    <div
      className="relative w-full h-[80%] overflow-auto bg-[#f0f4f8]"
      data-testid="sprite-editor"
      onClick={handleCanvasClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
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
