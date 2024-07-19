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

  toggleSelectedFile: file =>
    set(state => {
      const newSelectedFiles = new Set(state.selectedFiles);
      if (newSelectedFiles.has(file)) {
        newSelectedFiles.delete(file);
      } else {
        newSelectedFiles.add(file);
      }
      return { selectedFiles: newSelectedFiles };
    }),
}));

export default useFileStore;
