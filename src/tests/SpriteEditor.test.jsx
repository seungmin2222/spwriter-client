import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, vi, beforeEach, expect, beforeAll } from 'vitest';
import SpriteEditor from '../components/SpriteEditor';
import useFileStore from '../../store';
import * as utils from '../utils/utils';

vi.mock('../../store', () => ({
  default: vi.fn(),
}));

vi.mock('../utils/utils', () => ({
  handleFiles: vi.fn(),
  handleDragOverFiles: vi.fn(),
  resizeSelectedImages: vi.fn(() =>
    Promise.resolve({
      newCoordinates: [{ x: 0, y: 0, width: 150, height: 150 }],
      resizedImage: null,
    })
  ),
  calculateCoordinates: vi.fn(() => [{ x: 0, y: 0, width: 50, height: 50 }]),
}));

vi.mock('../utils/spriteAnalyzer', () => ({
  default: vi.fn(() => [{ x: 0, y: 0, width: 50, height: 50 }]),
}));

describe('SpriteEditor', () => {
  let getByTestId;
  let queryByText;
  let mockStore;

  beforeAll(() => {
    global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillStyle: '',
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(400) })),
      createPattern: vi.fn(() => ({})),
    }));

    global.HTMLCanvasElement.prototype.toBlob = vi.fn(callback =>
      callback(new Blob())
    );
    global.URL.createObjectURL = vi.fn(() => 'mockedObjectURL');
  });

  beforeEach(() => {
    mockStore = {
      coordinates: [
        {
          img: { complete: true, src: 'test.png', width: 100, height: 100 },
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          circle: { x: 100, y: 100, radius: 8 },
        },
      ],
      setCoordinates: vi.fn(),
      padding: 0,
      selectedFiles: new Set(),
      setSelectedFiles: vi.fn(),
      files: [],
      setFiles: vi.fn(),
      addHistory: vi.fn(),
      alignElement: 'left-right',
      addToast: vi.fn(),
    };

    useFileStore.mockImplementation(selector => selector(mockStore));

    const rendered = render(<SpriteEditor />);
    getByTestId = rendered.getByTestId;
    queryByText = rendered.queryByText;
  });

  it('선택된 이미지가 시각적으로 표시됩니다', () => {
    const canvas = getByTestId('canvas');

    fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 });
    fireEvent.mouseUp(canvas, { clientX: 50, clientY: 50 });

    expect(mockStore.setSelectedFiles).toHaveBeenCalledWith(expect.any(Set));
  });

  it('캔버스 마우스 다운을 처리합니다', () => {
    const canvas = getByTestId('canvas');
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
  });

  it('캔버스 마우스 이동을 처리합니다', () => {
    const canvas = getByTestId('canvas');
    fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
  });

  it('캔버스 마우스 업을 처리합니다', () => {
    const canvas = getByTestId('canvas');
    fireEvent.mouseUp(canvas, { clientX: 150, clientY: 150 });
  });

  it('파일 드롭을 처리합니다', () => {
    const editor = getByTestId('sprite-editor');
    const file = new File([''], 'test.png', { type: 'image/png' });
    fireEvent.drop(editor, { dataTransfer: { files: [file] } });
    expect(utils.handleFiles).toHaveBeenCalled();
  });

  it('키보드 이벤트를 처리합니다', () => {
    const editor = getByTestId('sprite-editor');
    fireEvent.keyDown(editor, { key: 'Shift' });
    fireEvent.keyUp(editor, { key: 'Shift' });
  });

  it('마우스 이동 시 툴팁 가시성을 업데이트합니다', () => {
    const canvas = getByTestId('canvas');
    fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
    const tooltip = queryByText(
      'Shift 키를 누른 채로 리사이즈하면 비율이 유지됩니다.'
    );
    expect(tooltip).toBeTruthy();
  });

  it('리사이징 시 좌표를 업데이트합니다', () => {
    mockStore.coordinates[0].circle = { x: 110, y: 110, radius: 8 };
    const canvas = getByTestId('canvas');

    fireEvent.mouseDown(canvas, { clientX: 110, clientY: 110 });
    fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
    fireEvent.mouseUp(canvas, { clientX: 150, clientY: 150 });

    expect(mockStore.setCoordinates).toHaveBeenCalled();
  });

  it('선택 상자를 사용하여 이미지를 적절히 선택합니다', () => {
    mockStore.coordinates.push({
      img: { complete: true, src: 'test2.png', width: 100, height: 100 },
      x: 120,
      y: 120,
      width: 100,
      height: 100,
      circle: { x: 220, y: 220, radius: 8 },
    });

    const canvas = getByTestId('canvas');
    fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 });
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(canvas, { clientX: 200, clientY: 200 });

    expect(mockStore.setSelectedFiles).toHaveBeenCalled();
  });

  it('Shift 키 누름을 처리하여 종횡비를 유지합니다', () => {
    const canvas = getByTestId('canvas');

    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.keyDown(document, { key: 'Shift' });
    fireEvent.mouseMove(canvas, { clientX: 150, clientY: 120 });
    fireEvent.mouseUp(canvas, { clientX: 150, clientY: 120 });
    fireEvent.keyUp(document, { key: 'Shift' });

    expect(mockStore.setCoordinates).toHaveBeenCalled();
  });
});
