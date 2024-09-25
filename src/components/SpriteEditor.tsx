import React, { useEffect, useRef, useState, useCallback } from 'react';
import useFileStore from '../../store.js';
import {
  handleFiles,
  handleDragOverFiles,
  resizeSelectedImages,
  calculateCoordinates,
} from '../utils/utils';
import analyzeSpritesSheet from '../utils/spriteAnalyzer';
import fileImageIcon from '../assets/images/file-image-regular.svg';

interface PackedImage {
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
  circle?: { x: number; y: number; radius: number } | undefined;
}

interface Size {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

interface Sprite {
  x: number;
  y: number;
  width: number;
  height: number;
}

type MouseEventWithNativeEvent =
  | MouseEvent
  | (React.MouseEvent<HTMLDivElement> & { nativeEvent: MouseEvent });

function SpriteEditor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const coordinates = useFileStore(state => state.coordinates) || [];
  const setCoordinates = useFileStore(state => state.setCoordinates);
  const padding = useFileStore(state => state.padding);
  const selectedFiles =
    useFileStore(state => state.selectedFiles) || new Set<HTMLImageElement>();
  const setSelectedFiles = useFileStore(state => state.setSelectedFiles);
  const files = useFileStore(state => state.files);
  const setFiles = useFileStore(state => state.setFiles);
  const addHistory = useFileStore(state => state.addHistory);
  const alignElement = useFileStore(state => state.alignElement);
  const addToast = useFileStore(state => state.addToast);

  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizing, setResizing] = useState<PackedImage | null>(null);
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });
  const [originalSize, setOriginalSize] = useState<Size>({
    width: 0,
    height: 0,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [dragEnd, setDragEnd] = useState<Position>({ x: 0, y: 0 });
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
  }>({ show: false, x: 0, y: 0 });

  let changeCoordinates: PackedImage[] | null = null;

  useEffect(() => {
    if (canvasRef.current && files.length > 0) {
      drawImages();
    }
  }, [coordinates, padding, selectedFiles, files, alignElement]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      const handleMouseMove = (e: MouseEvent) => handleCanvasMouseMove(e);
      const handleMouseUp = (e: MouseEvent) => handleCanvasMouseUp(e);
      const handleMouseDown = (e: MouseEvent) => handleCanvasMouseDown(e);

      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('mousedown', handleMouseDown);

      return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mousedown', handleMouseDown);
      };
    }

    return undefined;
  }, [isResizing, resizing, startPos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const createCheckerboardPattern = (): HTMLCanvasElement => {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 20;
    patternCanvas.height = 20;
    const patternContext = patternCanvas.getContext('2d');

    if (patternContext) {
      patternContext.fillStyle = '#ccc';
      patternContext.fillRect(0, 0, 10, 10);
      patternContext.fillRect(10, 10, 10, 10);
    }

    return patternCanvas;
  };

  const drawImages = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setupCanvas = (width: number, height: number) => {
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = ctx.createPattern(createCheckerboardPattern(), 'repeat')!;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawImage = (
      coord: PackedImage,
      xOffset: number = 0,
      yOffset: number = 0
    ) => {
      if (!coord.img.complete) return;
      ctx.drawImage(coord.img, xOffset, yOffset, coord.width, coord.height);
    };

    const drawSelection = (
      coord: PackedImage,
      xOffset: number = 0,
      yOffset: number = 0
    ) => {
      const isSelected = selectedFiles.has(coord.img);
      const newCoord = coord;

      if (!isSelected) {
        newCoord.circle = undefined;
        return;
      }

      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.strokeRect(xOffset, yOffset, coord.width, coord.height);

      const circleRadius = 8;
      const circleOffset = -10;
      const circleX = xOffset + coord.width + circleOffset;
      const circleY = yOffset + coord.height + circleOffset;

      ctx.beginPath();
      ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#2b67d1';
      ctx.fill();

      newCoord.circle = { x: circleX, y: circleY, radius: circleRadius };
    };

    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      setupCanvas(canvas.width, canvas.height);
      return;
    }

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

  const handleCanvasMouseDown = (e: MouseEventWithNativeEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let clickedOnResizeHandle = false;

    if (Array.isArray(coordinates)) {
      coordinates.forEach((coord: PackedImage) => {
        if (coord.circle) {
          const dist = Math.sqrt(
            (x - coord.circle.x) ** 2 + (y - coord.circle.y) ** 2
          );

          if (dist <= coord.circle.radius) {
            clickedOnResizeHandle = true;
            setResizing(coord);
            setStartPos({ x, y });
            setOriginalSize({ width: coord.width, height: coord.height });
            setIsResizing(true);
            setIsDragging(false);
          }
        }
      });
    }

    if (!clickedOnResizeHandle) {
      setIsResizing(false);
      setIsDragging(true);
      setDragStart({ x, y });
      setDragEnd({ x, y });
    }
  };

  const drawSelectionBox = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawImages();

    const left = Math.min(dragStart.x, dragEnd.x);
    const top = Math.min(dragStart.y, dragEnd.y);
    const width = Math.abs(dragEnd.x - dragStart.x);
    const height = Math.abs(dragEnd.y - dragStart.y);

    ctx.fillStyle = 'rgba(35, 33, 47, 0.3)';
    ctx.fillRect(left, top, width, height);

    ctx.strokeStyle = '#23212f';
    ctx.lineWidth = 2;
    ctx.strokeRect(left, top, width, height);
  };

  const handleCanvasMouseMove = (e: MouseEventWithNativeEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isResizing && resizing) {
      const deltaX = x - startPos.x;
      const deltaY = y - startPos.y;

      let newWidth: number;
      let newHeight: number;

      if (isShiftPressed) {
        const aspectRatio = originalSize.width / originalSize.height;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newWidth = Math.max(originalSize.width + deltaX, 10);
          newHeight = newWidth / aspectRatio;
        } else {
          newHeight = Math.max(originalSize.height + deltaY, 10);
          newWidth = newHeight * aspectRatio;
        }
      } else {
        newWidth = Math.max(originalSize.width + deltaX, 10);
        newHeight = Math.max(originalSize.height + deltaY, 10);
      }

      const updatedCoordinates = coordinates.map((coord: PackedImage) => {
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

    let cursorStyle: string = 'default';
    let showTooltip: boolean = false;
    let tooltipX: number = 0;
    let tooltipY: number = 0;

    if (Array.isArray(coordinates)) {
      coordinates.forEach((coord: PackedImage) => {
        if (coord.circle) {
          const dist = Math.sqrt(
            (x - coord.circle.x) ** 2 + (y - coord.circle.y) ** 2
          );
          if (dist <= coord.circle.radius) {
            cursorStyle = 'nwse-resize';
            showTooltip = true;
            tooltipX = x;
            tooltipY = y;
          }
        }
      });
    }

    canvas.style.cursor = cursorStyle;
    setTooltip({ show: showTooltip, x: tooltipX, y: tooltipY });
  };

  const scrollToResizedImage = (resizedCoord: PackedImage) => {
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

  const handleCanvasClick = (e: MouseEventWithNativeEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const x = e.clientX - rect.left - scrollLeft;
    const y = e.clientY - rect.top - scrollTop;

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

  const isImageInSelectionBox = (coord: PackedImage): boolean => {
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

  const clearSelectionBox = () => {
    drawImages();
  };

  const handleCanvasMouseUp = (e: MouseEventWithNativeEvent) => {
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
        handleCanvasClick(e);
      }
      clearSelectionBox();
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFiles: File[] = Array.from(e.dataTransfer.files);
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

    addHistory(coordinates);

    const image = coordinates[0].img;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      addToast('Canvas context를 생성할 수 없습니다.');
      setIsExtracting(false);
      return;
    }

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const sprites = analyzeSpritesSheet(
      Array.from(imageData),
      canvas.width,
      canvas.height
    );

    const createImageFromSprite = async (
      newCanvas: HTMLCanvasElement,
      sprite: Sprite
    ): Promise<HTMLImageElement> => {
      const { x, y, width, height } = sprite;
      const spriteCanvas = document.createElement('canvas');
      const newCtx = spriteCanvas.getContext('2d');
      if (!newCtx) throw new Error('Failed to get context');

      spriteCanvas.width = width;
      spriteCanvas.height = height;
      newCtx.drawImage(newCanvas, x, y, width, height, 0, 0, width, height);

      return new Promise(resolve => {
        spriteCanvas.toBlob(blob => {
          if (!blob) throw new Error('Failed to create blob');
          const file = new File([blob], `sprite_${Date.now()}.png`, {
            type: 'image/png',
          });
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = () => resolve(img);
        });
      });
    };

    const spriteImages = await Promise.all(
      sprites.map(sprite => createImageFromSprite(canvas, sprite))
    );

    const newFiles = await Promise.all(
      spriteImages.map(async img => {
        const blob = await new Promise<Blob | null>(resolve => {
          const spriteCanvas = document.createElement('canvas');
          const spriteCtx = spriteCanvas.getContext('2d');

          if (spriteCtx) {
            spriteCanvas.width = img.width;
            spriteCanvas.height = img.height;
            spriteCtx.drawImage(img, 0, 0);
            spriteCanvas.toBlob(newBlob => resolve(newBlob), 'image/png');
          } else {
            resolve(null);
          }
        });

        if (blob) {
          return new File([blob], `sprite_${Date.now()}.png`, {
            type: 'image/png',
          });
        }
        return null;
      })
    );

    const filteredFiles = newFiles.filter(file => file !== null) as File[];

    const htmlImageElements = await Promise.all(
      filteredFiles.map(file => {
        return new Promise<HTMLImageElement>(resolve => {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = () => resolve(img);
        });
      })
    );

    setFiles(prevFiles => [...prevFiles, ...filteredFiles]);

    const newCoordinates = calculateCoordinates(
      htmlImageElements,
      padding,
      alignElement
    );

    setCoordinates(newCoordinates);
    setIsExtracting(false);

    if (htmlImageElements.length === 1) {
      addToast('추출할 스프라이트 이미지가 없습니다.');
    } else {
      addToast(
        `${htmlImageElements.length}개의 이미지가 성공적으로 추출되었습니다.`
      );
    }
  }, [coordinates, setFiles, padding, alignElement, setCoordinates]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files: uploadFile } = e.target;
    if (uploadFile) {
      const newSelectFiles: File[] = Array.from(files);
      handleFiles(
        newSelectFiles,
        setFiles,
        setCoordinates,
        coordinates,
        padding,
        alignElement
      );
    }
  };

  return (
    <div
      className="relative w-full h-[84%] overflow-auto sprite-editor"
      data-testid="sprite-editor"
      onDrop={handleDrop}
      onDragOver={handleDragOverFiles}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      role="application"
      aria-label="Sprite Editor Canvas"
    >
      {coordinates.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <button
            tabIndex={0}
            type="button"
            className="flex bg-[#f8f8fd] text-[#6b7280] text-xl border rounded-[1rem] p-3 animate-fadeIn select-none cursor-pointer"
            onClick={handleClick}
          >
            이미지 파일을 드래그하여 놓거나 클릭하여 선택하세요.
            <img src={fileImageIcon} alt="파일 아이콘" className="h-7 ml-2" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
            multiple
            accept="image/*"
          />
        </div>
      ) : (
        <>
          <canvas ref={canvasRef} className="flex" data-testid="canvas" />
          {coordinates.length === 1 && (
            <button
              type="button"
              onClick={extractSpritesFromSheet}
              disabled={isExtracting}
              className={`absolute top-4 right-4 bg-[#241f3a] hover:bg-[#565465] text-white font-bold py-2 px-4 rounded-[1rem] animate-fadeIn duration-300 ${
                isExtracting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isExtracting ? '추출 중...' : '스프라이트 시트 추출'}
            </button>
          )}
        </>
      )}
      {tooltip.show && (
        <div
          className="absolute bg-[#241f3a] text-white p-2 rounded-[1rem] text-sm z-10 animate-fadeInFast"
          style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
        >
          Shift 키를 누른 채로 리사이즈하면 비율이 유지됩니다.
        </div>
      )}
    </div>
  );
}

export default SpriteEditor;
