import create from 'zustand';

export const useFileStore = create(set => ({
  files: [],
  setFiles: files => set({ files }),
  padding: 10,
  setPadding: padding => set({ padding }),
  coordinates: [],
  setCoordinates: coordinates => set({ coordinates }),
  addCoordinates: newCoords =>
    set(state => ({ coordinates: [...state.coordinates, ...newCoords] })),
  canvasRef: null,
  setCanvasRef: canvasRef => set({ canvasRef }),
}));
