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
  selectedIndices: new Set(),
  setSelectedIndices: selectedIndices => set({ selectedIndices }),
  toggleSelectedIndex: index =>
    set(state => {
      const newSelectedIndices = new Set(state.selectedIndices);
      if (newSelectedIndices.has(index)) {
        newSelectedIndices.delete(index);
      } else {
        newSelectedIndices.add(index);
      }
      return { selectedIndices: newSelectedIndices };
    }),
}));

export default useFileStore;
