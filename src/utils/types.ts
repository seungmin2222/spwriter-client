export interface PackedImage {
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
  circle?: { x: number; y: number; radius: number };
}

export interface FileStoreState {
  files: File[];
  padding: number;
  coordinates: PackedImage[];
  toast: Toast | null;
  selectedFiles: Set<HTMLImageElement>;
  fileName: string;
  resizedImage: PackedImage | null;
  history: PackedImage[][];
  redoHistory: PackedImage[][];
  alignElement: AlignElement;
}

export interface FileStoreActions {
  setFiles: (filesOrUpdater: File[] | ((files: File[]) => File[])) => void;
  setPadding: (padding: number) => void;
  setCoordinates: (coordinates: PackedImage[]) => void;
  setToast: (toast: Toast | null) => void;
  addToast: (message: string) => void;
  setSelectedFiles: (selectedFiles: Set<HTMLImageElement>) => void;
  setFileName: (fileName: string) => void;
  setResizedImage: (resizedImage: PackedImage | null) => void;
  setAlignElement: (alignElement: AlignElement) => void;
  addHistory: (prevCoordinates: PackedImage[]) => void;
  popHistory: () => void;
  pushHistory: () => void;
}

export interface Toast {
  id: number;
  message: string;
}

export interface Sprite {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AlignElement = 'bin-packing' | 'top-bottom' | 'left-right';

export type FileStore = FileStoreState & FileStoreActions;
