import React, { useEffect, useRef } from 'react';
import { useFileStore } from '../../store';

export const SpriteEditor = () => {
  const canvasRef = useRef();
  const setCanvasRef = useFileStore(state => state.setCanvasRef);
  const coordinates = useFileStore(state => state.coordinates);
  const padding = useFileStore(state => state.padding);

  useEffect(() => {
    setCanvasRef(canvasRef);
  }, [setCanvasRef]);

  useEffect(() => {
    if (canvasRef.current && coordinates.length > 0) {
      drawImages();
    }
  }, [coordinates, padding]);

  const drawImages = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalWidth = coordinates.reduce(
      (acc, coord) => acc + coord.width + padding,
      -padding
    );
    const maxHeight = Math.max(...coordinates.map(coord => coord.height));
    canvas.width = totalWidth;
    canvas.height = maxHeight;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = ctx.createPattern(createCheckerboardPattern(), 'repeat');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let xOffset = 0;
    coordinates.forEach(coord => {
      ctx.drawImage(coord.img, xOffset, 0, coord.width, coord.height);
      coord.x = xOffset;
      coord.y = 0;
      xOffset += coord.width + padding;
    });
  };

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

  return (
    <div
      className="relative w-full h-[80%] overflow-auto bg-[#f0f4f8]"
      data-testid="sprite-editor"
    >
      <canvas ref={canvasRef} className="flex"></canvas>
    </div>
  );
};
