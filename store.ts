import { create } from 'zustand';
import { FileStore } from 'utils/types';

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
