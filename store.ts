import { create } from 'zustand';

interface PackedImage {
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
}

interface Toast {
  id: number;
  message: string;
}

interface FileStore {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;

  padding: number;
  setPadding: (padding: number) => void;

  coordinates: PackedImage[];
  setCoordinates: (coordinates: PackedImage[]) => void;

  toast: Toast | null;
  setToast: (toast: Toast | null) => void;
  addToast: (message: string) => void;

  selectedFiles: Set<HTMLImageElement>;
  setSelectedFiles: (selectedFiles: Set<HTMLImageElement>) => void;

  fileName: string;
  setFileName: (fileName: string) => void;

  resizedImage: PackedImage | null;
  setResizedImage: (resizedImage: PackedImage | null) => void;

  history: PackedImage[][];
  redoHistory: PackedImage[][];

  alignElement: 'bin-packing' | 'top-bottom' | 'left-right';
  setAlignElement: (
    alignElement: 'bin-packing' | 'top-bottom' | 'left-right'
  ) => void;

  addHistory: (prevCoordinates: PackedImage[]) => void;

  popHistory: () => void;

  pushHistory: () => void;
}

const useFileStore = create<FileStore>(set => ({
  files: [],
  setFiles: filesOrUpdater =>
    set(state => {
      const newFiles =
        typeof filesOrUpdater === 'function'
          ? filesOrUpdater(state.files)
          : filesOrUpdater;
      return { files: newFiles };
    }),

  padding: 10,
  setPadding: padding => set({ padding }),

  coordinates: [],
  setCoordinates: coordinates => set({ coordinates }),

  toast: null,
  setToast: toast => set({ toast }),
  addToast: message => set(() => ({ toast: { id: Date.now(), message } })),

  selectedFiles: new Set(),
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
      return { history, redoHistory: state.redoHistory };
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
      return { redoHistory, history: state.history };
    }),
}));

export default useFileStore;
