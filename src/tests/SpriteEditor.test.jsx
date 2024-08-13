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

  it('Selected images are visually indicated', () => {
    const canvas = getByTestId('canvas');

    fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 });
    fireEvent.mouseUp(canvas, { clientX: 50, clientY: 50 });

    expect(mockStore.setSelectedFiles).toHaveBeenCalledWith(expect.any(Set));
  });

  it('handles canvas mouse down', () => {
    const canvas = getByTestId('canvas');
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
  });

  it('handles canvas mouse move', () => {
    const canvas = getByTestId('canvas');
    fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
  });

  it('handles canvas mouse up', () => {
    const canvas = getByTestId('canvas');
    fireEvent.mouseUp(canvas, { clientX: 150, clientY: 150 });
  });

  it('handles file drop', () => {
    const editor = getByTestId('sprite-editor');
    const file = new File([''], 'test.png', { type: 'image/png' });
    fireEvent.drop(editor, { dataTransfer: { files: [file] } });
    expect(utils.handleFiles).toHaveBeenCalled();
  });

  it('handles keyboard events', () => {
    const editor = getByTestId('sprite-editor');
    fireEvent.keyDown(editor, { key: 'Shift' });
    fireEvent.keyUp(editor, { key: 'Shift' });
  });

  it('updates tooltip visibility on mouse move', () => {
    const canvas = getByTestId('canvas');
    fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
    const tooltip = queryByText(
      'Shift 키를 누른 채로 리사이즈하면 비율이 유지됩니다.'
    );
    expect(tooltip).toBeTruthy();
  });

  it('updates coordinates on resizing', () => {
    mockStore.coordinates[0].circle = { x: 110, y: 110, radius: 8 };
    const canvas = getByTestId('canvas');

    fireEvent.mouseDown(canvas, { clientX: 110, clientY: 110 });
    fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
    fireEvent.mouseUp(canvas, { clientX: 150, clientY: 150 });

    expect(mockStore.setCoordinates).toHaveBeenCalled();
  });

  it('properly selects images using selection box', () => {
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

  it('handles shift key press for aspect ratio preservation', () => {
    const canvas = getByTestId('canvas');

    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.keyDown(document, { key: 'Shift' });
    fireEvent.mouseMove(canvas, { clientX: 150, clientY: 120 });
    fireEvent.mouseUp(canvas, { clientX: 150, clientY: 120 });
    fireEvent.keyUp(document, { key: 'Shift' });

    expect(mockStore.setCoordinates).toHaveBeenCalled();
  });
});
