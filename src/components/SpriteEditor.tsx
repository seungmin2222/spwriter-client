import React, { useEffect, useRef, useState, useCallback } from 'react';
import useFileStore from '../../store.js';

import {
  drawSelectionBox,
  drawImages,
  scrollToResizedImage,
  selectImagesInBox,
  clearSelectionBox,
  handleCanvasClick,
} from '../utils/spriteEditorUtils.js';
import analyzeSpritesSheet from '../utils/spriteAnalyzer';
import { resizeSelectedImages } from '../utils/imageSelectUtils.js';
import { calculateCoordinates } from '../utils/coordinateUtils.js';
import { handleDragOverFiles, handleFiles } from '../utils/fileUtils.js';
import { PackedImage, Sprite } from '../utils/types.js';

interface Size {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

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

  const isResizingRef = useRef<boolean>(false);
  const resizingRef = useRef<PackedImage | null>(null);
  const startPosRef = useRef<Position>({ x: 0, y: 0 });
  const originalSizeRef = useRef<Size>({ width: 0, height: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<Position>({ x: 0, y: 0 });
  const dragEndRef = useRef<Position>({ x: 0, y: 0 });
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

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
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
            resizingRef.current = coord;
            startPosRef.current = { x, y };
            originalSizeRef.current = {
              width: coord.width,
              height: coord.height,
            };
            isResizingRef.current = true;
            isDraggingRef.current = false;
          }
        }
      });
    }

    if (!clickedOnResizeHandle) {
      isResizingRef.current = false;
      isDraggingRef.current = true;
      dragStartRef.current = { x, y };
      dragEndRef.current = { x, y };
    }

    setTooltip({ show: false, x: 0, y: 0 });

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  const handleCanvasMouseMove = (e: MouseEvent | React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isResizingRef.current && resizingRef.current) {
      const deltaX = x - startPosRef.current.x;
      const deltaY = y - startPosRef.current.y;

      let newWidth: number;
      let newHeight: number;

      if (isShiftPressed) {
        const aspectRatio =
          originalSizeRef.current.width / originalSizeRef.current.height;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newWidth = Math.max(originalSizeRef.current.width + deltaX, 10);
          newHeight = newWidth / aspectRatio;
        } else {
          newHeight = Math.max(originalSizeRef.current.height + deltaY, 10);
          newWidth = newHeight * aspectRatio;
        }
      } else {
        newWidth = Math.max(originalSizeRef.current.width + deltaX, 10);
        newHeight = Math.max(originalSizeRef.current.height + deltaY, 10);
      }

      const updatedCoordinates = coordinates.map((coord: PackedImage) => {
        if (coord === resizingRef.current) {
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
    } else if (isDraggingRef.current) {
      const currentDragEnd = { x, y };
      dragEndRef.current = currentDragEnd;
      drawImages(
        canvasRef.current,
        coordinates,
        selectedFiles,
        padding,
        alignElement
      );
      drawSelectionBox(
        canvasRef.current,
        canvasRef.current.getContext('2d'),
        dragStartRef.current,
        currentDragEnd
      );
    } else {
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

      canvasRef.current.style.cursor = cursorStyle;
      setTooltip({ show: showTooltip, x: tooltipX, y: tooltipY });
    }
  };

  const handleCanvasMouseUp = (e: MouseEvent) => {
    if (!canvasRef.current) return;

    if (isResizingRef.current) {
      isResizingRef.current = false;
      resizingRef.current = null;
      if (changeCoordinates) {
        addHistory(coordinates);
        setCoordinates(changeCoordinates);
        resizeSelectedImages(
          changeCoordinates,
          selectedFiles,
          setCoordinates,
          setSelectedFiles
        ).then(
          ({
            newCoordinates,
            resizedImage,
          }: {
            newCoordinates: PackedImage[];
            resizedImage: PackedImage | null;
          }) => {
            const images: HTMLImageElement[] = [];
            const fileNames: string[] = [];

            newCoordinates.forEach((coord: PackedImage) => {
              images.push(coord.img);
              fileNames.push(coord.fileName);
            });

            const calculatedCoordinates = calculateCoordinates(
              images,
              fileNames,
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
                (coord: PackedImage) => coord.img === resizedImage.img
              );
              if (updatedResizedImage) {
                scrollToResizedImage(updatedResizedImage, canvasRef.current);
              }
            }
          }
        );
      }
    } else if (isDraggingRef.current) {
      isDraggingRef.current = false;
      if (
        Math.abs(dragEndRef.current.x - dragStartRef.current.x) > 5 ||
        Math.abs(dragEndRef.current.y - dragStartRef.current.y) > 5
      ) {
        const newSelectedFiles = selectImagesInBox(
          coordinates,
          selectedFiles,
          dragStartRef.current,
          dragEndRef.current
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
        handleCanvasClick(
          e,
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

    window.removeEventListener('mousemove', handleWindowMouseMove);
    window.removeEventListener('mouseup', handleWindowMouseUp);
  };

  const handleWindowMouseMove = useCallback(
    (e: MouseEvent) => {
      handleCanvasMouseMove(e);
    },
    [handleCanvasMouseMove]
  );

  const handleWindowMouseUp = useCallback(
    (e: MouseEvent) => {
      handleCanvasMouseUp(e);
    },
    [handleCanvasMouseUp]
  );

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

    const filteredFiles = newFiles.filter(file => file !== null);

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
      filteredFiles.map(file => file.name.split('.')[0]),
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
      className="sprite-editor relative h-[84%] w-full overflow-auto"
      data-testid="sprite-editor"
      onDrop={handleDrop}
      onDragOver={handleDragOverFiles}
      role="application"
      aria-label="Sprite Editor Canvas"
    >
      {coordinates.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <button
            tabIndex={0}
            type="button"
            className="flex animate-fadeIn cursor-pointer select-none rounded-[1rem] border bg-[#f8f8fd] p-3 text-xl text-[#6b7280]"
            onClick={handleClick}
          >
            이미지 파일을 드래그하여 놓거나 클릭하여 선택하세요.
            <div className="fileImageIcon ml-2" />
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
          <canvas
            ref={canvasRef}
            className="flex"
            data-testid="canvas"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
          />
          {coordinates.length === 1 && (
            <button
              type="button"
              onClick={extractSpritesFromSheet}
              disabled={isExtracting}
              className={`absolute right-4 top-4 animate-fadeIn rounded-[1rem] bg-[#241f3a] px-4 py-2 font-bold text-white duration-300 hover:bg-[#565465] ${
                isExtracting ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              {isExtracting ? '추출 중...' : '스프라이트 시트 추출'}
            </button>
          )}
        </>
      )}
      {tooltip.show && (
        <div
          className="absolute z-10 animate-fadeInFast rounded-[1rem] bg-[#241f3a] p-2 text-sm text-white"
          style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
        >
          Shift 키를 누른 채로 리사이즈하면 비율이 유지됩니다.
        </div>
      )}
    </div>
  );
}

export default SpriteEditor;
