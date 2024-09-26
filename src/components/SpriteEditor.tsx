import React, { useEffect, useRef, useState, useCallback } from 'react';
import useFileStore from '../../store.js';
import {
  handleFiles,
  handleDragOverFiles,
  resizeSelectedImages,
  calculateCoordinates,
} from '../utils/utils';
import {
  drawSelectionBox,
  drawImages,
  scrollToResizedImage,
  selectImagesInBox,
  clearSelectionBox,
  handleCanvasClick,
} from '../utils/spriteEditorUtils.js';
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
      drawImages(
        canvasRef.current,
        coordinates,
        selectedFiles,
        padding,
        alignElement
      );
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
      drawImages(
        canvasRef.current,
        updatedCoordinates,
        selectedFiles,
        padding,
        alignElement
      );
    } else if (isDragging) {
      const currentDragEnd = { x, y };
      setDragEnd(currentDragEnd);
      drawImages(
        canvasRef.current,
        coordinates,
        selectedFiles,
        padding,
        alignElement
      );
      drawSelectionBox(
        canvas,
        canvas.getContext('2d'),
        dragStart,
        currentDragEnd
      );
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
          drawImages(
            canvasRef.current,
            calculatedCoordinates,
            selectedFiles,
            padding,
            alignElement
          );

          if (resizedImage) {
            const updatedResizedImage = calculatedCoordinates.find(
              coord => coord.img === resizedImage.img
            );
            if (updatedResizedImage) {
              scrollToResizedImage(updatedResizedImage, canvasRef.current);
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
        const newSelectedFiles = selectImagesInBox(
          coordinates,
          selectedFiles,
          dragStart,
          dragEnd
        );
        setSelectedFiles(newSelectedFiles);
        drawImages(
          canvasRef.current,
          coordinates,
          newSelectedFiles,
          padding,
          alignElement
        );
      } else {
        const event = e instanceof MouseEvent ? e : e.nativeEvent;
        handleCanvasClick(
          event,
          canvasRef.current,
          coordinates,
          selectedFiles,
          setSelectedFiles
        );
        drawImages(
          canvasRef.current,
          coordinates,
          selectedFiles,
          padding,
          alignElement
        );
      }
      clearSelectionBox(
        canvasRef.current,
        coordinates,
        selectedFiles,
        padding,
        alignElement
      );
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
      const newSelectFiles: File[] = Array.from(uploadFile);
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
