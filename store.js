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

  fileName: '',
  setFileName: fileName => set({ fileName }),

  cloneSelectedFiles: () => {
    set(state => {
      const { files, selectedFiles, coordinates } = state;

      if (selectedFiles.size === 0) {
        return;
      }

      const clonedImages = [];

      selectedFiles.forEach(file => {
        const fileIndex = coordinates.findIndex(coord => coord.img === file);
        if (fileIndex === -1) {
          return;
        }

        const coord = coordinates[fileIndex];
        const newImg = new Image();
        newImg.src = coord.img.src;

        newImg.onload = () => {
          const newCoord = {
            img: newImg,
            x: coord.x,
            y: coord.y,
            width: coord.width,
            height: coord.height,
          };

          clonedImages.push(newCoord);

          if (clonedImages.length === selectedFiles.size) {
            const updatedFiles = [...files, ...clonedImages.map(c => c.img)];
            const updatedCoordinates = [...coordinates, ...clonedImages];

            sortAndSetCoordinates(updatedCoordinates, newCoordinates => {
              set({
                files: updatedFiles,
                coordinates: newCoordinates,
              });
            });
          }
        };
      });
    });
  },

  updateCanvas: false,
  setUpdateCanvas: update => set({ updateCanvas: update }),
}));

export default useFileStore;
