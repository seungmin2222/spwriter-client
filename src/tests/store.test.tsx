import { act } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import useFileStore from '../../store';

interface PackedImage {
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
}

interface Toast {
  id: number;
  message: string;
}

describe('useFileStore', () => {
  let store: ReturnType<typeof useFileStore.getState>;

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
    const mockFiles = [new File([], 'file1'), new File([], 'file2')] as File[];
    act(() => {
      store.setFiles(mockFiles);
    });
    const newState = useFileStore.getState();
    expect(newState.files).toEqual(mockFiles);
  });

  it('패딩을 설정해야 합니다', () => {
    act(() => {
      store.setPadding(20);
    });
    const newState = useFileStore.getState();
    expect(newState.padding).toBe(20);
  });

  it('좌표를 설정해야 합니다', () => {
    const mockCoordinates: PackedImage[] = [
      {
        img: new Image(),
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotated: false,
      },
    ];
    act(() => {
      store.setCoordinates(mockCoordinates);
    });
    const newState = useFileStore.getState();
    expect(newState.coordinates).toEqual(mockCoordinates);
  });

  it('토스트를 설정해야 합니다', () => {
    const mockToast: Toast = { id: 1, message: 'Toast message' };
    act(() => {
      store.setToast(mockToast);
    });
    const newState = useFileStore.getState();
    expect(newState.toast).toEqual(mockToast);
  });

  it('토스트를 추가해야 합니다', () => {
    act(() => {
      store.addToast('New toast message');
    });
    const newState = useFileStore.getState();
    expect(newState.toast).toMatchObject({
      message: 'New toast message',
    });
    expect(newState.toast?.id).toBeDefined();
  });

  it('선택된 파일을 설정해야 합니다', () => {
    const mockImage1 = new Image();
    const mockImage2 = new Image();
    const newSelectedFiles = new Set([mockImage1, mockImage2]);
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
    const mockResizedImage: PackedImage = {
      img: new Image(),
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotated: false,
    };
    act(() => {
      store.setResizedImage(mockResizedImage);
    });
    const newState = useFileStore.getState();
    expect(newState.resizedImage).toEqual(mockResizedImage);
  });

  it('정렬 요소를 설정해야 합니다', () => {
    act(() => {
      store.setAlignElement('left-right');
    });
    const newState = useFileStore.getState();
    expect(newState.alignElement).toBe('left-right');
  });

  it('히스토리에 추가해야 합니다', () => {
    const prevCoordinates: PackedImage[] = [
      {
        img: new Image(),
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotated: false,
      },
    ];
    act(() => {
      store.addHistory(prevCoordinates);
    });
    const newState = useFileStore.getState();
    expect(newState.history).toContainEqual(prevCoordinates);
    expect(newState.redoHistory).toEqual([]);
  });

  it('히스토리에서 제거해야 합니다', () => {
    const initialCoordinates: PackedImage[] = [
      {
        img: new Image(),
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotated: false,
      },
    ];
    const newCoordinates: PackedImage[] = [
      {
        img: new Image(),
        x: 1,
        y: 1,
        width: 100,
        height: 100,
        rotated: false,
      },
    ];
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
    expect(newState.redoHistory).toContainEqual(newCoordinates);
  });

  it('히스토리를 푸시해야 합니다', () => {
    const initialCoordinates: PackedImage[] = [
      {
        img: new Image(),
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotated: false,
      },
    ];
    const newCoordinates: PackedImage[] = [
      {
        img: new Image(),
        x: 1,
        y: 1,
        width: 100,
        height: 100,
        rotated: false,
      },
    ];
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
    expect(newState.history).toContainEqual(initialCoordinates);
    expect(newState.redoHistory).toEqual([]);
  });
});
