import { create } from 'zustand';

const useFileStore = create(set => ({
  files: [],
  setFiles: files => set({ files }),

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

  history: [],
  redoHistory: [],

  alignElement: 'left-right',
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
