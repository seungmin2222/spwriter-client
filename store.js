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
}));

export default useFileStore;
