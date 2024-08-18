import { act } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import useFileStore from '../../store';

describe('useFileStore', () => {
  let store;

  beforeEach(() => {
    store = useFileStore.getState();
  });

  it('기본값으로 초기화되어야 합니다', () => {
    expect(store.files).toEqual([]);
    expect(store.padding).toBe(10);
    expect(store.coordinates).toEqual([]);
    expect(store.toast).toBeNull();
    expect(store.selectedFiles).toBeDefined();
  });

  it('파일을 설정해야 합니다', () => {
    act(() => {
      store.setFiles(['file1', 'file2']);
    });
    const newState = useFileStore.getState();
    expect(newState.files).toEqual(['file1', 'file2']);
  });

  it('패딩을 설정해야 합니다', () => {
    act(() => {
      store.setPadding(20);
    });
    const newState = useFileStore.getState();
    expect(newState.padding).toBe(20);
  });

  it('좌표를 설정해야 합니다', () => {
    act(() => {
      store.setCoordinates([{ x: 0, y: 0 }]);
    });
    const newState = useFileStore.getState();
    expect(newState.coordinates).toEqual([{ x: 0, y: 0 }]);
  });

  it('토스트를 설정해야 합니다', () => {
    act(() => {
      store.setToast({ id: 1, message: 'Toast message' });
    });
    const newState = useFileStore.getState();
    expect(newState.toast).toEqual({ id: 1, message: 'Toast message' });
  });

  it('토스트를 추가해야 합니다', () => {
    act(() => {
      store.addToast('New toast message');
    });
    const newState = useFileStore.getState();
    expect(newState.toast).toMatchObject({
      message: 'New toast message',
    });
    expect(newState.toast.id).toBeDefined();
  });

  it('선택된 파일을 설정해야 합니다', () => {
    const newSelectedFiles = new Set(['file1', 'file2']);
    act(() => {
      store.setSelectedFiles(newSelectedFiles);
    });
    const newState = useFileStore.getState();
    expect(newState.selectedFiles).toEqual(newSelectedFiles);
  });

  it('파일 이름을 설정해야 합니다', () => {
    act(() => {
      store.setFileName('test.jpg');
    });
    const newState = useFileStore.getState();
    expect(newState.fileName).toBe('test.jpg');
  });

  it('크기 조정된 이미지를 설정해야 합니다', () => {
    const mockImage = new Blob([''], { type: 'image/jpeg' });
    act(() => {
      store.setResizedImage(mockImage);
    });
    const newState = useFileStore.getState();
    expect(newState.resizedImage).toBe(mockImage);
  });

  it('정렬 요소를 설정해야 합니다', () => {
    act(() => {
      store.setAlignElement('grid');
    });
    const newState = useFileStore.getState();
    expect(newState.alignElement).toBe('grid');
  });

  it('히스토리에 추가해야 합니다', () => {
    const prevCoordinates = [{ x: 0, y: 0 }];
    act(() => {
      store.addHistory(prevCoordinates);
    });
    const newState = useFileStore.getState();
    expect(newState.history).toContain(prevCoordinates);
    expect(newState.redoHistory).toEqual([]);
  });

  it('히스토리에서 제거해야 합니다', () => {
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

  it('히스토리를 푸시해야 합니다', () => {
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
