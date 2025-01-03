import { calculateCoordinates, sortAndSetCoordinates } from './coordinateUtils';
import { trimImage } from './imageProcessing';
import { PackedImage } from './types';

export const handleFiles = async (
  files: File[],
  setFiles: React.Dispatch<React.SetStateAction<File[]>>,
  setCoordinates: (coords: PackedImage[]) => void,
  coordinates: PackedImage[],
  padding: number,
  alignElement: 'bin-packing' | 'top-bottom' | 'left-right'
) => {
  const filesArray = Array.from(files);
  const images: HTMLImageElement[] = [];
  const fileNames: string[] = [];

  setFiles(prevFiles => [...prevFiles, ...filesArray]);

  const newImages = await Promise.all(
    filesArray.map(
      file =>
        new Promise<{ img: HTMLImageElement; fileName: string }>(resolve => {
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              trimImage(img).then(trimmedImage =>
                resolve({
                  img: trimmedImage,
                  fileName: file.name.split('.')[0],
                })
              );
            };
            img.src = reader.result as string;
          };
          reader.readAsDataURL(file);
        })
    )
  );

  newImages.forEach(image => {
    images.push(image.img);
    fileNames.push(image.fileName);
  });

  const newCoordinates = calculateCoordinates(
    images,
    fileNames,
    padding,
    alignElement
  );

  const updatedCoordinates = coordinates.concat(newCoordinates);

  if (JSON.stringify(updatedCoordinates) !== JSON.stringify(coordinates)) {
    sortAndSetCoordinates(updatedCoordinates, setCoordinates);
  }
};

export const handleDragOverFiles = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();
};
