import { AlignElement } from './types';

interface Coordinate {
  x: number;
  y: number;
  width: number;
  height: number;
  img: HTMLImageElement;
}

interface HandleDownloadParams {
  coordinates: Coordinate[];
  padding: number;
  alignElement: AlignElement;
  addToast: (message: string) => void;
  fileName?: string;
}

export const downloadUtility = ({
  coordinates,
  padding,
  alignElement,
  addToast,
  fileName,
}: HandleDownloadParams) => {
  if (coordinates.length === 0) {
    addToast('다운로드할 이미지가 없습니다.');
    return;
  }

  const downloadCanvas = document.createElement('canvas');
  const downloadCtx = downloadCanvas.getContext('2d');

  if (!downloadCtx) {
    addToast('Canvas context를 생성할 수 없습니다.');
    return;
  }

  let totalWidth = 0;
  let maxHeight = 0;

  if (alignElement === 'left-right') {
    totalWidth = coordinates.reduce(
      (acc, coord) => acc + coord.width + padding,
      padding
    );
    maxHeight =
      Math.max(...coordinates.map(coord => coord.height)) + padding * 2;
  } else if (alignElement === 'top-bottom') {
    totalWidth =
      Math.max(...coordinates.map(coord => coord.width)) + padding * 2;
    maxHeight = coordinates.reduce(
      (acc, coord) => acc + coord.height + padding,
      padding
    );
  } else if (alignElement === 'bin-packing') {
    totalWidth =
      Math.max(...coordinates.map(coord => coord.x + coord.width)) + padding;
    maxHeight =
      Math.max(...coordinates.map(coord => coord.y + coord.height)) + padding;
  }

  downloadCanvas.width = totalWidth;
  downloadCanvas.height = maxHeight;

  downloadCtx.clearRect(0, 0, downloadCanvas.width, downloadCanvas.height);

  coordinates.forEach(coord => {
    downloadCtx.drawImage(
      coord.img,
      coord.x,
      coord.y,
      coord.width,
      coord.height
    );
  });

  const link = document.createElement('a');
  link.href = downloadCanvas.toDataURL('image/png');
  link.download = fileName ? `${fileName}.png` : 'sprites.png';
  link.click();
};

export const handlePaddingChangeUtility = (
  e: React.ChangeEvent<HTMLInputElement>,
  setPadding: (value: number) => void,
  addToast: (message: string) => void
) => {
  const value = Number(e.target.value);
  if (value <= 0) {
    addToast('Padding 값은 1보다 작을 수 없습니다.');
  } else {
    setPadding(value);
  }
};
