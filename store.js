import { create } from 'zustand';

const useFileStore = create(set => ({
  files: [],
  setFiles: files => set({ files }),
  padding: 10,
  setPadding: padding => set({ padding }),
  coordinates: [],
  setCoordinates: coordinates => set({ coordinates }),
  canvasRef: null,
  setCanvasRef: canvasRef => set({ canvasRef }),
  toast: null,
  setToast: toast => set({ toast }),
  addToast: message => set(() => ({ toast: { id: Date.now(), message } })),
  lastClickedIndex: null,
  setLastClickedIndex: index => set({ lastClickedIndex: index }),
}));

export default useFileStore;
