import { render, fireEvent, RenderResult } from '@testing-library/react';
import {
  describe,
  it,
  vi,
  beforeEach,
  expect,
  beforeAll,
  afterEach,
} from 'vitest';
import SpriteEditor from '../components/SpriteEditor';
import { FileStoreState, PackedImage } from '../utils/types';
import { handleFiles } from '../utils/fileUtils';
import useFileStore from '../../store';

interface MockStore extends FileStoreState {
  setCoordinates: (coordinates: PackedImage[]) => void;
  setSelectedFiles: (files: Set<HTMLImageElement>) => void;
  addToast: (message: string) => void;
}

vi.mock('../utils/fileUtils', () => ({
  handleFiles: vi.fn(),
  handleDragOverFiles: vi.fn(),
}));

vi.mock('../utils/selectionUtils', () => ({
  resizeSelectedImages: vi.fn(() =>
    Promise.resolve({
      newCoordinates: [{ x: 0, y: 0, width: 150, height: 150 }],
      resizedImage: null,
    })
  ),
}));

vi.mock('../utils/spriteAnalyzer', () => ({
  default: vi.fn(() => [{ x: 0, y: 0, width: 50, height: 50 }]),
}));

describe('SpriteEditor', () => {
  let getByTestId: RenderResult['getByTestId'];
  let queryByText: RenderResult['queryByText'];
  let mockStore: MockStore;

  beforeAll(() => {
    window.HTMLCanvasElement.prototype.toBlob = vi.fn(callback =>
      callback(new Blob())
    );
    window.URL.createObjectURL = vi.fn(() => 'mockedObjectURL');
  });

  beforeEach(() => {
    const imgElement = new Image();
    imgElement.src = 'test.png';
    imgElement.width = 100;
    imgElement.height = 100;

    mockStore = {
      files: [],
      padding: 10,
      coordinates: [
        {
          img: imgElement,
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          rotated: false,
          circle: { x: 100, y: 100, radius: 8 },
        },
      ],
      toast: null,
      selectedFiles: new Set<HTMLImageElement>(),
      fileName: '',
      resizedImage: null,
      history: [],
      redoHistory: [],
      alignElement: 'bin-packing',
      setCoordinates: vi.fn(),
      setSelectedFiles: vi.fn(),
      addToast: vi.fn(),
    };

    useFileStore.setState(mockStore);

    const rendered = render(<SpriteEditor />);
    getByTestId = rendered.getByTestId;
    queryByText = rendered.queryByText;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('선택된 이미지가 시각적으로 표시됩니다', () => {
    const canvas = getByTestId('canvas');
    fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 });
    fireEvent.mouseUp(canvas, { clientX: 50, clientY: 50 });
    expect(mockStore.setSelectedFiles).toHaveBeenCalledWith(expect.any(Set));
  });

  it('캔버스 마우스 이벤트를 처리합니다', () => {
    const canvas = getByTestId('canvas');
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
    fireEvent.mouseUp(canvas, { clientX: 150, clientY: 150 });
    expect(mockStore.setCoordinates).toHaveBeenCalled();
  });

  it('파일 드롭을 처리합니다', () => {
    const editor = getByTestId('sprite-editor');
    const file = new File([''], 'test.png', { type: 'image/png' });
    fireEvent.drop(editor, { dataTransfer: { files: [file] } });
    expect(handleFiles).toHaveBeenCalled();
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
    const imgElement2 = new Image();
    imgElement2.src = 'test2.png';
    imgElement2.width = 100;
    imgElement2.height = 100;

    mockStore.coordinates.push({
      img: imgElement2,
      x: 120,
      y: 120,
      width: 100,
      height: 100,
      rotated: false,
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
