import React, { useEffect, useRef, useState, useCallback } from 'react';
import useFileStore from '../../store';
import {
  handleFiles,
  handleDragOverFiles,
  resizeSelectedImages,
  calculateCoordinates,
} from '../utils/utils';
import { analyzeSpritesSheet } from '../utils/spriteAnalyzer';
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
  const alignElement = useFileStore(state => state.alignElement);
  const addToast = useFileStore(state => state.addToast);

  const [isResizing, setIsResizing] = useState(false);
  const [resizing, setResizing] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 });
  const [isExtracting, setIsExtracting] = useState(false);

  let changeCoordinates = null;

  useEffect(() => {
    if (canvasRef.current && files.length > 0) {
      drawImages();
    }
  }, [coordinates, padding, selectedFiles, files, alignElement]);

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

    const setupCanvas = (width, height) => {
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = ctx.createPattern(createCheckerboardPattern(), 'repeat');
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawImage = (coord, xOffset = 0, yOffset = 0) => {
      if (!coord.img.complete) return;
      ctx.drawImage(coord.img, xOffset, yOffset, coord.width, coord.height);
    };

    const drawSelection = (coord, xOffset = 0, yOffset = 0) => {
      const isSelected = selectedFiles.has(coord.img);
      if (!isSelected) {
        coord.circle = null;
        return;
      }

      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 1;
      ctx.strokeRect(xOffset, yOffset, coord.width, coord.height);

      const circleRadius = 8;
      const circleOffset = -10;
      const circleX = xOffset + coord.width + circleOffset;
      const circleY = yOffset + coord.height + circleOffset;

      ctx.beginPath();
      ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#1d4ed8';
      ctx.fill();

      coord.circle = { x: circleX, y: circleY, radius: circleRadius };
    };

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

  const handleCanvasMouseDown = event => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const x = event.clientX - rect.left - scrollLeft;
    const y = event.clientY - rect.top - scrollTop;

    let clickedOnResizeHandle = false;
    coordinates.forEach(coord => {
      if (coord.circle) {
        const dist = Math.sqrt(
          Math.pow(x - coord.circle.x, 2) + Math.pow(y - coord.circle.y, 2)
        );

        if (dist <= coord.circle.radius) {
          clickedOnResizeHandle = true;
          setResizing(coord);
          setStartPos({ x, y });
          setOriginalSize({ width: coord.width, height: coord.height });
          setIsResizing(true);
          setIsDragging(false);
          return;
        }
      }
    });

    if (!clickedOnResizeHandle) {
      setIsResizing(false);
      setIsDragging(true);
      setDragStart({ x, y });
      setDragEnd({ x, y });
    }
  };

  const handleCanvasMouseMove = event => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const x = event.clientX - rect.left - scrollLeft;
    const y = event.clientY - rect.top - scrollTop;

    if (isResizing && resizing) {
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
    } else if (isDragging) {
      setDragEnd({ x, y });
      drawImages();
      drawSelectionBox();
    }
  };

  const handleCanvasMouseUp = event => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isResizing) {
      setIsResizing(false);
      setResizing(null);
      if (changeCoordinates) {
        addHistory(coordinates);
        setCoordinates(changeCoordinates);
        resizeSelectedImages(
          changeCoordinates,
          selectedFiles,
          setCoordinates,
          setSelectedFiles
        ).then(({ newCoordinates, resizedImage }) => {
          const calculatedCoordinates = calculateCoordinates(
            newCoordinates.map(coord => coord.img),
            padding,
            alignElement
          );
          setCoordinates(calculatedCoordinates);
          drawImages();

          if (resizedImage) {
            const updatedResizedImage = calculatedCoordinates.find(
              coord => coord.img === resizedImage.img
            );
            if (updatedResizedImage) {
              scrollToResizedImage(updatedResizedImage);
            }
          }
        });
      }
    } else if (isDragging) {
      setIsDragging(false);
      if (
        Math.abs(dragEnd.x - dragStart.x) > 5 ||
        Math.abs(dragEnd.y - dragStart.y) > 5
      ) {
        selectImagesInBox();
      } else {
        handleCanvasClick(event);
      }
      clearSelectionBox();
    }
  };

  const drawSelectionBox = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    drawImages();

    const left = Math.min(dragStart.x, dragEnd.x);
    const top = Math.min(dragStart.y, dragEnd.y);
    const width = Math.abs(dragEnd.x - dragStart.x);
    const height = Math.abs(dragEnd.y - dragStart.y);

    ctx.fillStyle = 'rgba(135, 206, 250, 0.3)';
    ctx.fillRect(left, top, width, height);

    ctx.strokeStyle = 'rgb(30, 144, 255)';
    ctx.lineWidth = 2;
    ctx.strokeRect(left, top, width, height);
  };

  const selectImagesInBox = () => {
    const newSelectedFiles = new Set(selectedFiles);
    coordinates.forEach(coord => {
      if (isImageInSelectionBox(coord)) {
        if (newSelectedFiles.has(coord.img)) {
          newSelectedFiles.delete(coord.img);
        } else {
          newSelectedFiles.add(coord.img);
        }
      }
    });
    setSelectedFiles(newSelectedFiles);
    drawImages();
  };

  const isImageInSelectionBox = coord => {
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

  const clearSelectionBox = () => {
    drawImages();
  };

  const scrollToResizedImage = resizedCoord => {
    const container = document.querySelector('.sprite-editor');
    const canvas = canvasRef.current;

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

  const handleCanvasClick = event => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const x = event.clientX - rect.left - scrollLeft;
    const y = event.clientY - rect.top - scrollTop;

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

        setSelectedFiles(newSelectedFiles);
        drawImages();
      }
    });
  };

  const handleDrop = useCallback(
    event => {
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
    },
    [setFiles, setCoordinates, coordinates, padding, alignElement]
  );

  const extractSpritesFromSheet = useCallback(async () => {
    if (coordinates.length !== 1) return;
    setIsExtracting(true);

    const image = coordinates[0].img;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const sprites = analyzeSpritesSheet(imageData, canvas.width, canvas.height);

    const spriteImages = await Promise.all(
      sprites.map(sprite => createImageFromSprite(canvas, sprite))
    );

    setFiles(prevFiles => [...prevFiles, ...spriteImages]);

    const newCoordinates = calculateCoordinates(
      spriteImages,
      padding,
      alignElement
    );
    setCoordinates(newCoordinates);
    setIsExtracting(false);

    if (spriteImages.length === 1) {
      addToast('추출할 스프라이트 이미지가 없습니다.');
    } else {
      addToast(
        `${spriteImages.length}개의 이미지가 성공적으로 추출되었습니다.`
      );
    }
  }, [coordinates, setFiles, padding, alignElement, setCoordinates]);

  const createImageFromSprite = async (canvas, sprite) => {
    const { x, y, width, height } = sprite;
    const spriteCanvas = document.createElement('canvas');
    const ctx = spriteCanvas.getContext('2d');
    spriteCanvas.width = width;
    spriteCanvas.height = height;
    ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

    return new Promise(resolve => {
      spriteCanvas.toBlob(blob => {
        const file = new File([blob], `sprite_${Date.now()}.png`, {
          type: 'image/png',
        });
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => resolve(img);
      });
    });
  };

  return (
    <div
      className="relative w-full h-[80%] overflow-auto bg-[#f0f4f8] sprite-editor"
      data-testid="sprite-editor"
      onDrop={handleDrop}
      onDragOver={handleDragOverFiles}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
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
        <>
          <canvas
            ref={canvasRef}
            className="flex"
            data-testid="canvas"
          ></canvas>
          {coordinates.length === 1 && (
            <button
              onClick={extractSpritesFromSheet}
              disabled={isExtracting}
              className={`absolute top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                isExtracting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isExtracting ? '추출 중...' : '스프라이트 시트 추출'}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default SpriteEditor;
