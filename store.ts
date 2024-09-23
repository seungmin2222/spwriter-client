import { create } from 'zustand';

export interface PackedImage {
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
  circle?: {
    x: number;
    y: number;
    radius: number;
  };
}

interface Toast {
  id: number;
  message: string;
}

export type AlignElement = 'bin-packing' | 'top-bottom' | 'left-right';

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

export type FileStore = FileStoreState & FileStoreActions;

const useFileStore = create<FileStore>(set => ({
  files: [],
  setFiles: filesOrUpdater =>
    set(state => ({
      files:
        typeof filesOrUpdater === 'function'
          ? filesOrUpdater(state.files)
          : filesOrUpdater,
    })),

  padding: 10,
  setPadding: padding => set({ padding }),

  coordinates: [],
  setCoordinates: coordinates => set({ coordinates }),

  toast: null,
  setToast: toast => set({ toast }),
  addToast: message => set({ toast: { id: Date.now(), message } }),

  selectedFiles: new Set<HTMLImageElement>(),
  setSelectedFiles: selectedFiles => set({ selectedFiles }),

  fileName: '',
  setFileName: fileName => set({ fileName }),

  resizedImage: null,
  setResizedImage: resizedImage => set({ resizedImage }),

  history: [],
  redoHistory: [],

  alignElement: 'bin-packing',
  setAlignElement: alignElement => set({ alignElement }),

  addHistory: prevCoordinates =>
    set(state => ({
      history: [...state.history, prevCoordinates],
      redoHistory: [],
    })),

  popHistory: () =>
    set(state => {
      const history = [...state.history];
      const lastState = history.pop();
      if (lastState) {
        return {
          history,
          coordinates: lastState,
          redoHistory: [state.coordinates, ...state.redoHistory],
        };
      }
      return state;
    }),

  pushHistory: () =>
    set(state => {
      const redoHistory = [...state.redoHistory];
      const nextState = redoHistory.shift();
      if (nextState) {
        return {
          coordinates: nextState,
          redoHistory,
          history: [...state.history, state.coordinates],
        };
      }
      return state;
    }),
}));

export default useFileStore;
