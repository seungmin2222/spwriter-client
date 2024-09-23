import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ImageList from '../components/ImageList';
import useFileStore from '../../store';

interface PackedImage {
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
}

vi.mock('../components/Modal', () => ({
  __esModule: true,
  default: ({
    showModal,
    handleClose,
    handleConfirm,
  }: {
    showModal: boolean;
    handleClose: () => void;
    handleConfirm: () => void;
  }) =>
    showModal ? (
      <div data-testid="mock-modal">
        <button onClick={handleClose}>Close</button>
        <button onClick={handleConfirm}>Confirm</button>
      </div>
    ) : null,
}));

vi.mock('../components/ResizeModal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onClose,
    onConfirm,
    setWidth,
    setHeight,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    setWidth: (width: string) => void;
    setHeight: (height: string) => void;
  }) =>
    isOpen ? (
      <div data-testid="mock-resize-modal">
        <input aria-label="너비" onChange={e => setWidth(e.target.value)} />
        <input aria-label="높이" onChange={e => setHeight(e.target.value)} />
        <button onClick={onConfirm}>확인</button>
        <button onClick={onClose}>취소</button>
      </div>
    ) : null,
}));

describe('ImageList component', () => {
  const mockCoordinates: PackedImage[] = [
    {
      img: Object.assign(new Image(), {
        src: 'image1.png',
        width: 100,
        height: 100,
      }),
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      rotated: false,
    },
    {
      img: Object.assign(new Image(), {
        src: 'image2.png',
        width: 100,
        height: 100,
      }),
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      rotated: false,
    },
  ];

  beforeEach(() => {
    const mockContext = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(400) })),
    };

    HTMLCanvasElement.prototype.toDataURL = vi.fn(
      () => 'data:image/png;base64,mockDataUrl'
    );

    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    useFileStore.setState({
      coordinates: mockCoordinates,
      selectedFiles: new Set(),
      setCoordinates: vi.fn(),
      addHistory: vi.fn(),
      setSelectedFiles: vi.fn(),
      setFiles: vi.fn(),
      addToast: vi.fn(),
    });
  });

  describe('UI Rendering', () => {
    it('이미지가 없을 때 빈 상태 메시지를 렌더링합니다', () => {
      useFileStore.setState({ coordinates: [] });
      render(<ImageList />);
      expect(
        screen.getByText('이미지 파일을 드래그하여 놓거나 클릭하여 선택하세요.')
      ).toBeInTheDocument();
    });

    it('올바른 수의 이미지 항목을 렌더링합니다', () => {
      render(<ImageList />);
      const imageItems = screen.getAllByRole('button', { name: /Thumbnail/ });
      expect(imageItems).toHaveLength(mockCoordinates.length);
    });
  });

  describe('Image Selection', () => {
    it('모든 이미지를 선택하고 선택 해제합니다', () => {
      render(<ImageList />);

      fireEvent.click(screen.getByText('전체 선택'));
      expect(useFileStore.getState().setSelectedFiles).toHaveBeenCalledWith(
        new Set(mockCoordinates.map(coord => coord.img))
      );

      fireEvent.click(screen.getByText('전체 해제'));
      expect(useFileStore.getState().setSelectedFiles).toHaveBeenCalledWith(
        new Set()
      );
    });

    it('개별 이미지 선택을 처리합니다', () => {
      const mockSetSelectedFiles = vi.fn();
      useFileStore.setState({ setSelectedFiles: mockSetSelectedFiles });
      render(<ImageList />);

      const imageItem = screen.getByRole('button', { name: /Thumbnail 0/ });
      fireEvent.click(imageItem);

      expect(mockSetSelectedFiles).toHaveBeenCalledWith(
        new Set([mockCoordinates[0].img])
      );
    });

    it('이미지 선택을 위한 키보드 탐색을 처리합니다', () => {
      const mockSetSelectedFiles = vi.fn();
      useFileStore.setState({ setSelectedFiles: mockSetSelectedFiles });
      render(<ImageList />);

      const imageItem = screen.getByRole('button', { name: /Thumbnail 0/ });
      fireEvent.keyDown(imageItem, { key: 'Enter', code: 'Enter' });
      expect(mockSetSelectedFiles).toHaveBeenCalledWith(
        new Set([mockCoordinates[0].img])
      );

      fireEvent.keyDown(imageItem, { key: ' ', code: 'Space' });
      expect(mockSetSelectedFiles).toHaveBeenCalled();
    });
  });

  describe('Image Operations', () => {
    it('파일 드롭을 올바르게 처리합니다', async () => {
      const mockFile = new File(['dummy content'], 'test.png', {
        type: 'image/png',
      });
      const mockSetFiles = vi.fn();
      useFileStore.setState({ setFiles: mockSetFiles });

      render(<ImageList />);
      const dropzone = screen.getByTestId('image-list');

      await act(async () => {
        fireEvent.drop(dropzone, { dataTransfer: { files: [mockFile] } });
      });

      expect(mockSetFiles).toHaveBeenCalled();
    });

    it('선택된 좌표를 클립보드에 복사합니다', async () => {
      useFileStore.setState({
        selectedFiles: new Set([mockCoordinates[0].img]),
      });
      render(<ImageList />);

      fireEvent.click(screen.getByText('선택좌표 복사'));

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('.sprite-0')
        );
      });
    });
  });

  describe('Modal Interactions', () => {
    it('삭제 확인 모달을 열고 닫습니다', () => {
      render(<ImageList />);
      const deleteButtons = screen.getAllByRole('button', { name: /cross/i });

      fireEvent.click(deleteButtons[0]);
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });

    it('크기 조정 모달을 열고 닫습니다', () => {
      useFileStore.setState({
        selectedFiles: new Set([mockCoordinates[0].img]),
      });
      render(<ImageList />);

      fireEvent.click(screen.getByText('크기 조정'));
      expect(screen.getByTestId('mock-resize-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByText('취소'));
      expect(screen.queryByTestId('mock-resize-modal')).not.toBeInTheDocument();
    });
  });

  describe('Deletion', () => {
    it('단일 이미지를 삭제합니다', async () => {
      render(<ImageList />);
      const deleteButtons = screen.getAllByRole('button', { name: /cross/i });

      fireEvent.click(deleteButtons[0]);
      fireEvent.click(screen.getByText('Confirm'));

      await waitFor(() => {
        expect(useFileStore.getState().setCoordinates).toHaveBeenCalled();
      });
    });

    it('선택된 여러 이미지를 삭제합니다', async () => {
      useFileStore.setState({
        selectedFiles: new Set([
          mockCoordinates[0].img,
          mockCoordinates[1].img,
        ]),
      });
      render(<ImageList />);

      fireEvent.click(screen.getByText('선택삭제'));
      fireEvent.click(screen.getByText('Confirm'));

      await waitFor(() => {
        expect(useFileStore.getState().setCoordinates).toHaveBeenCalled();
      });
    });
  });
});
