import { Dispatch } from 'react';
import { PackedImage } from './types';

const deleteImagesUtil = (
  imagesToDelete: Set<HTMLImageElement>,
  addHistory: (coords: PackedImage[]) => void,
  coordinates: PackedImage[],
  setCoordinates: (coordinates: PackedImage[]) => void,
  setSelectedFiles: (selectedFiles: Set<HTMLImageElement>) => void,
  setDeletingImages: Dispatch<Set<HTMLImageElement>>,
  generateToast: (message: string) => void
): void => {
  addHistory(coordinates);
  setDeletingImages(new Set(imagesToDelete));

  setTimeout(() => {
    const updatedCoordinates = coordinates.filter(
      coord => !imagesToDelete.has(coord.img)
    );

    setCoordinates(updatedCoordinates);
    setSelectedFiles(new Set());
    setDeletingImages(new Set());
    generateToast(
      `${imagesToDelete.size > 1 ? '선택된 이미지가' : '이미지가'} 삭제되었습니다.`
    );
  }, 400);
};

export default deleteImagesUtil;
