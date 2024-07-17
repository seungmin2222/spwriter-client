import React, { useEffect, useRef } from 'react';
import useFileStore from '../../store';

function SpriteEditor() {
  const canvasRef = useRef(null);
  const setCanvasRef = useFileStore(state => state.setCanvasRef);
  const coordinates = useFileStore(state => state.coordinates);
  const padding = useFileStore(state => state.padding);
  const setCoordinates = useFileStore(state => state.setCoordinates);

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
    const updatedCoordinates = coordinates.map(coord => {
      if (coord.img.complete) {
        ctx.drawImage(coord.img, xOffset, padding, coord.width, coord.height);
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

  useEffect(() => {
    setCanvasRef(canvasRef);
  }, [setCanvasRef]);

  useEffect(() => {
    if (canvasRef.current && coordinates.length > 0) {
      drawImages();
    }
  }, [coordinates, padding]);

  return (
    <div
      className="relative w-full h-[80%] overflow-auto bg-[#f0f4f8]"
      data-testid="sprite-editor"
    >
      <canvas ref={canvasRef} className="flex" data-testid="canvas"></canvas>
    </div>
  );
}

export default SpriteEditor;
