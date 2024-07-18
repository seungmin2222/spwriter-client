import { act } from 'react-dom/test-utils';
import useFileStore from '../../store';

describe('useFileStore', () => {
  let store;

  beforeEach(() => {
    store = useFileStore.getState();
  });

  it('should initialize with default values', () => {
    expect(store.files).toEqual([]);
    expect(store.padding).toBe(10);
    expect(store.coordinates).toEqual([]);
    expect(store.canvasRef).toBeNull();
    expect(store.toast).toBeNull();
    expect(store.lastClickedIndex).toBeNull();
  });

  it('should set files', () => {
    act(() => {
      store.setFiles(['file1', 'file2']);
    });
    const newState = useFileStore.getState();
    expect(newState.files).toEqual(['file1', 'file2']);
  });

  it('should set padding', () => {
    act(() => {
      store.setPadding(20);
    });
    const newState = useFileStore.getState();
    expect(newState.padding).toBe(20);
  });

  it('should set coordinates', () => {
    act(() => {
      store.setCoordinates([{ x: 0, y: 0 }]);
    });
    const newState = useFileStore.getState();
    expect(newState.coordinates).toEqual([{ x: 0, y: 0 }]);
  });

  it('should set canvasRef', () => {
    const canvasRef = { current: {} };

    act(() => {
      store.setCanvasRef(canvasRef);
    });
    const newState = useFileStore.getState();
    expect(newState.canvasRef).toEqual(canvasRef);
  });

  it('should set toast', () => {
    act(() => {
      store.setToast({ id: 1, message: 'Toast message' });
    });
    const newState = useFileStore.getState();
    expect(newState.toast).toEqual({ id: 1, message: 'Toast message' });
  });

  it('should add toast', () => {
    act(() => {
      store.addToast('New toast message');
    });
    const newState = useFileStore.getState();
    expect(newState.toast).toMatchObject({
      message: 'New toast message',
    });
    expect(newState.toast.id).toBeDefined();
  });

  it('should set lastClickedIndex', () => {
    act(() => {
      store.setLastClickedIndex(2);
    });
    const newState = useFileStore.getState();
    expect(newState.lastClickedIndex).toBe(2);
  });
});
