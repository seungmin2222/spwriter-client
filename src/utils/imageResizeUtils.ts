import { Dispatch, SetStateAction } from 'react';
import { AlignElement, PackedImage } from './types';
import { calculateCoordinates } from './coordinateUtils';

const handleResizeConfirmUtil = (
  modalWidth: string,
  modalHeight: string,
  coordinates: PackedImage[],
  selectedFiles: Set<HTMLImageElement>,
  addHistory: (coords: PackedImage[]) => void,
  setCoordinates: (coordinates: PackedImage[]) => void,
  setSelectedFiles: (selectedFiles: Set<HTMLImageElement>) => void,
  setResizeModalOpen: Dispatch<SetStateAction<boolean>>,
  setModalWidth: Dispatch<SetStateAction<string>>,
  setModalHeight: Dispatch<SetStateAction<string>>,
  generateToast: (message: string) => void,
  padding: number,
  alignElement: AlignElement
): void => {
  const width = parseInt(modalWidth, 10);
  const height = parseInt(modalHeight, 10);

  if (
    Number.isNaN(width) ||
    Number.isNaN(height) ||
    width <= 0 ||
    height <= 0
  ) {
    generateToast('유효한 너비와 높이를 입력해주세요.');
    return;
  }

  addHistory(coordinates);

  const newSelectedFiles = new Set<HTMLImageElement>();

  const processImage = async (
    coord: PackedImage,
    transformCallback: (
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement
    ) => void
  ): Promise<HTMLImageElement> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    canvas.width = coord.img.width;
    canvas.height = coord.img.height;

    await transformCallback(ctx, canvas);

    const processedImg = new Image();
    processedImg.src = canvas.toDataURL();

    return new Promise<HTMLImageElement>(resolve => {
      processedImg.onload = () => resolve(processedImg);
    });
  };

  const resizePromises = coordinates.map(async (coord: PackedImage) => {
    if (selectedFiles.has(coord.img)) {
      const resizedImg: HTMLImageElement = await processImage(
        coord,
        (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
          const newCanvas = canvas;
          newCanvas.width = width;
          newCanvas.height = height;
          ctx.drawImage(coord.img, 0, 0, width, height);
        }
      );

      newSelectedFiles.add(resizedImg);

      const createPackedImage = (
        img: HTMLImageElement,
        x: number,
        y: number,
        imageWidth: number,
        imageHeight: number,
        rotated: boolean
      ): PackedImage => ({
        img,
        x,
        y,
        width,
        height,
        rotated,
      });

      return createPackedImage(
        resizedImg,
        coord.x,
        coord.y,
        width,
        height,
        coord.rotated
      );
    }

    return coord;
  });

  Promise.all(resizePromises).then((updatedCoordinates: PackedImage[]) => {
    const reorderedCoordinates = calculateCoordinates(
      updatedCoordinates.map(coord => coord.img),
      padding,
      alignElement
    );

    setCoordinates(reorderedCoordinates);
    setSelectedFiles(newSelectedFiles);
    setResizeModalOpen(false);
    setModalWidth('');
    setModalHeight('');
    generateToast('선택된 이미지의 크기가 조정되었습니다.');
  });
};

export default handleResizeConfirmUtil;
