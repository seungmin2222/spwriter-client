import React, { useEffect, useRef, useState } from 'react';
import useFileStore from '../../store';
import {
  handleFiles,
  handleDragOverFiles,
  resizeSelectedImages,
} from '../utils/utils';

import fileImageIcon from '../assets/images/file-image-regular.svg';

function SpriteEditor() {
  const canvasRef = useRef(null);
  const coordinates = useFileStore(state => state.coordinates);
  const setCoordinates = useFileStore(state => state.setCoordinates);
  const padding = useFileStore(state => state.padding);
  const selectedFiles = useFileStore(state => state.selectedFiles) || new Set();
  const setSelectedFiles = useFileStore(state => state.setSelectedFiles);
  const files = useFileStore(state => state.files);
  const setFiles = useFileStore(state => state.setFiles);
  const addHistory = useFileStore(state => state.addHistory);

  const [isResizing, setIsResizing] = useState(false);
  const [resizing, setResizing] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });

  let changeCoordinates = null;

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

    coordinates.forEach(coord => {
      if (!coord.img.complete) return;

      ctx.drawImage(coord.img, xOffset, padding, coord.width, coord.height);

      const isSelected = selectedFiles.has(coord.img);

      if (isSelected) {
        ctx.strokeStyle = '#1a5a91';
        ctx.lineWidth = 1;
        ctx.strokeRect(xOffset, padding, coord.width, coord.height);

        const circleRadius = 8;
        const circleOffset = -10;
        ctx.beginPath();
        ctx.arc(
          xOffset + coord.width + circleOffset,
          padding + coord.height + circleOffset,
          circleRadius,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = '#1a5a91';
        ctx.fill();

        coord.circle = {
          x: xOffset + coord.width + circleOffset,
          y: padding + coord.height + circleOffset,
          radius: circleRadius,
        };
      } else {
        coord.circle = null;
      }

      xOffset += coord.width + padding;
    });
  };

  const handleCanvasMouseDown = event => {
    setIsResizing(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let xOffset = 0;

    for (const coord of coordinates) {
      if (coord.circle) {
        const dist = Math.sqrt(
          Math.pow(x - coord.circle.x, 2) + Math.pow(y - coord.circle.y, 2)
        );

        if (dist <= coord.circle.radius) {
          setResizing(coord);
          setStartPos({ x, y });
          setOriginalSize({ width: coord.width, height: coord.height });
          setIsResizing(true);
          return;
        }
      }

      xOffset += coord.width + padding;
    }
  };

  const handleCanvasMouseMove = event => {
    if (!isResizing || !resizing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const deltaX = x - startPos.x;
    const deltaY = y - startPos.y;

    const newWidth = Math.max(originalSize.width + deltaX, 10);
    const newHeight = Math.max(originalSize.height + deltaY, 10);

    const updatedCoordinates = coordinates.map(coord => {
      if (coord === resizing) {
        return {
          ...coord,
          width: newWidth,
          height: newHeight,
        };
      }
      return coord;
    });
    changeCoordinates = updatedCoordinates;
    setCoordinates(updatedCoordinates);

    drawImages();
  };

  const handleCanvasMouseUp = () => {
    if (isResizing) {
      setIsResizing(false);
      setResizing(null);
      if (changeCoordinates) {
        addHistory(coordinates);
        resizeSelectedImages(changeCoordinates, selectedFiles, setCoordinates);
      }
    }
  };

  const handleCanvasClick = event => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let xOffset = 0;
    const newSelectedFiles = new Set(selectedFiles);

    for (const coord of coordinates) {
      const startX = xOffset;
      const endX = xOffset + coord.width;
      const startY = padding;
      const endY = padding + coord.height;

      if (x >= startX && x <= endX && y >= startY && y <= endY) {
        if (newSelectedFiles.has(coord.img)) {
          newSelectedFiles.delete(coord.img);
        } else {
          newSelectedFiles.add(coord.img);
        }

        setSelectedFiles(newSelectedFiles);
        drawImages();
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

  useEffect(() => {
    if (canvasRef.current && files.length > 0) {
      drawImages();
    }
  }, [coordinates, padding, selectedFiles, files]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      canvas.addEventListener('mousemove', handleCanvasMouseMove);
      canvas.addEventListener('mouseup', handleCanvasMouseUp);
      canvas.addEventListener('mousedown', handleCanvasMouseDown);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousemove', handleCanvasMouseMove);
        canvas.removeEventListener('mouseup', handleCanvasMouseUp);
        canvas.removeEventListener('mousedown', handleCanvasMouseDown);
      }
    };
  }, [isResizing, resizing, startPos]);

  return (
    <div
      className="relative w-full h-[80%] overflow-auto bg-[#f0f4f8]"
      data-testid="sprite-editor"
      onClick={handleCanvasClick}
      onDrop={handleDrop}
      onDragOver={handleDragOverFiles}
      onMouseDown={handleCanvasMouseDown}
      onMouseUp={handleCanvasMouseUp}
      tabIndex={0}
      aria-label="Sprite Editor Canvas"
    >
      {coordinates.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <span className="flex text-[#6b7280] text-xl border rounded-md p-2 animate-fadeIn select-none">
            이미지 파일을 드래그하여 놓으세요.
            <img src={fileImageIcon} alt="파일 아이콘" className="h-7 ml-2" />
          </span>
        </div>
      ) : (
        <canvas ref={canvasRef} className="flex" data-testid="canvas"></canvas>
      )}
    </div>
  );
}

export default SpriteEditor;
