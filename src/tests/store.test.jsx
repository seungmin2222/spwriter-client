import { act } from 'react-dom/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
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
    expect(store.toast).toBeNull();
    expect(store.selectedFiles).toBeDefined();
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
  it('should set selected files', () => {
    const newSelectedFiles = new Set(['file1', 'file2']);
    act(() => {
      store.setSelectedFiles(newSelectedFiles);
    });
    const newState = useFileStore.getState();
    expect(newState.selectedFiles).toEqual(newSelectedFiles);
  });

  it('should set file name', () => {
    act(() => {
      store.setFileName('test.jpg');
    });
    const newState = useFileStore.getState();
    expect(newState.fileName).toBe('test.jpg');
  });

  it('should set resized image', () => {
    const mockImage = new Blob([''], { type: 'image/jpeg' });
    act(() => {
      store.setResizedImage(mockImage);
    });
    const newState = useFileStore.getState();
    expect(newState.resizedImage).toBe(mockImage);
  });

  it('should set align element', () => {
    act(() => {
      store.setAlignElement('grid');
    });
    const newState = useFileStore.getState();
    expect(newState.alignElement).toBe('grid');
  });

  it('should add to history', () => {
    const prevCoordinates = [{ x: 0, y: 0 }];
    act(() => {
      store.addHistory(prevCoordinates);
    });
    const newState = useFileStore.getState();
    expect(newState.history).toContain(prevCoordinates);
    expect(newState.redoHistory).toEqual([]);
  });

  it('should pop history', () => {
    const initialCoordinates = [{ x: 0, y: 0 }];
    const newCoordinates = [{ x: 1, y: 1 }];
    act(() => {
      store.setCoordinates(initialCoordinates);
      store.addHistory(initialCoordinates);
      store.setCoordinates(newCoordinates);
    });
    act(() => {
      store.popHistory();
    });
    const newState = useFileStore.getState();
    expect(newState.coordinates).toEqual(initialCoordinates);
    expect(newState.redoHistory).toContain(newCoordinates);
  });

  it('should push history', () => {
    const initialCoordinates = [{ x: 0, y: 0 }];
    const newCoordinates = [{ x: 1, y: 1 }];
    act(() => {
      store.setCoordinates(initialCoordinates);
      store.addHistory(initialCoordinates);
      store.setCoordinates(newCoordinates);
      store.popHistory();
    });
    act(() => {
      store.pushHistory();
    });
    const newState = useFileStore.getState();
    expect(newState.coordinates).toEqual(newCoordinates);
    expect(newState.history).toContain(initialCoordinates);
    expect(newState.redoHistory).toEqual([]);
  });
});
