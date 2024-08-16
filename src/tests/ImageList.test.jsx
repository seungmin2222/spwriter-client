import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ImageList from '../components/ImageList';
import useFileStore from '../../store';

vi.mock('../components/Modal', () => ({
  __esModule: true,
  default: ({ showModal, handleClose, handleConfirm }) => {
    return showModal ? (
      <div data-testid="mock-modal">
        <button onClick={handleClose}>Close</button>
        <button onClick={handleConfirm}>Confirm</button>
      </div>
    ) : null;
  },
}));

vi.mock('../components/ResizeModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onConfirm, setWidth, setHeight }) => {
    return isOpen ? (
      <div data-testid="mock-resize-modal">
        <input aria-label="너비" onChange={e => setWidth(e.target.value)} />
        <input aria-label="높이" onChange={e => setHeight(e.target.value)} />
        <button onClick={onConfirm}>확인</button>
        <button onClick={onClose}>취소</button>
      </div>
    ) : null;
  },
}));

describe('ImageList component', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(),
      },
    });

    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.onload();
        }, 100);
      }
    };

    useFileStore.setState({
      coordinates: [
        {
          img: { src: 'image1.png', width: 100, height: 100 },
          width: 100,
          height: 100,
          x: 0,
          y: 0,
        },
        {
          img: { src: 'image2.png', width: 100, height: 100 },
          width: 100,
          height: 100,
          x: 0,
          y: 0,
        },
      ],
      selectedFiles: new Set(),
      setCoordinates: vi.fn(),
      addHistory: vi.fn(),
      setSelectedFiles: vi.fn(),
    });
  });

  it('handles mouse hover state correctly', () => {
    render(<ImageList />);
    const listItems = screen.getAllByRole('button', { tabIndex: 0 });
    expect(listItems.length).toBeGreaterThan(0);
    const listItem = listItems[0];

    const deleteButton = screen.getAllByRole('button', { name: /cross/i })[0];

    fireEvent.mouseLeave(deleteButton);
    expect(listItem).toHaveClass('hover:bg-[#25203b]');
  });

  it('closes the modal when the Close button is clicked', () => {
    render(<ImageList />);
    const deleteButtons = screen.getAllByRole('button', { name: /cross/i });
    fireEvent.click(deleteButtons[0]);
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
  });

  it('closes the modal when the Confirm button is clicked', () => {
    render(<ImageList />);
    const deleteButtons = screen.getAllByRole('button', { name: /cross/i });
    fireEvent.click(deleteButtons[0]);
    fireEvent.click(screen.getByText('Confirm'));
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
  });

  it('shows toast when no images are selected', () => {
    useFileStore.setState({ selectedFiles: new Set() });
    render(<ImageList />);

    const resizeButton = screen.getByText('크기 조정');
    fireEvent.click(resizeButton);

    expect(screen.getByText('선택된 이미지가 없습니다.')).toBeInTheDocument();
  });

  it('opens resize modal when images are selected for resize', () => {
    useFileStore.setState({ selectedFiles: new Set(['image1.png']) });
    render(<ImageList />);

    const resizeButton = screen.getByText('크기 조정');
    fireEvent.click(resizeButton);

    expect(screen.getByTestId('mock-resize-modal')).toBeInTheDocument();
  });

  it('updates image size when valid dimensions are provided in resize modal', async () => {
    useFileStore.setState({ selectedFiles: new Set(['image1.png']) });
    render(<ImageList />);

    const resizeButton = screen.getByText('크기 조정');
    fireEvent.click(resizeButton);

    const widthInput = screen.getByLabelText('너비');
    const heightInput = screen.getByLabelText('높이');
    fireEvent.change(widthInput, { target: { value: '200' } });
    fireEvent.change(heightInput, { target: { value: '200' } });

    const confirmButton = screen.getByText('확인');
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(useFileStore.getState().setCoordinates).toHaveBeenCalled();
    expect(useFileStore.getState().addHistory).toHaveBeenCalled();
    expect(
      screen.getByText('선택된 이미지의 크기가 조정되었습니다.')
    ).toBeInTheDocument();
  });

  it('shows empty state message when no images are available', () => {
    useFileStore.setState({ coordinates: [] });
    render(<ImageList />);

    expect(
      screen.getByText('이미지 파일을 드래그하여 놓거나 클릭하여 선택하세요.')
    ).toBeInTheDocument();
  });

  it('selects all images when "전체 선택" button is clicked', () => {
    render(<ImageList />);
    const selectAllButton = screen.getByText('전체 선택');
    fireEvent.click(selectAllButton);
    expect(useFileStore.getState().setSelectedFiles).toHaveBeenCalledWith(
      new Set([
        { src: 'image1.png', width: 100, height: 100 },
        { src: 'image2.png', width: 100, height: 100 },
      ])
    );
  });

  it('deselects all images when "전체 해제" button is clicked', () => {
    render(<ImageList />);
    const deselectAllButton = screen.getByText('전체 해제');
    fireEvent.click(deselectAllButton);
    expect(useFileStore.getState().setSelectedFiles).toHaveBeenCalledWith(
      new Set()
    );
  });

  it('shows toast when trying to copy coordinates with no selection', () => {
    render(<ImageList />);
    const copyButton = screen.getByText('선택좌표 복사');
    fireEvent.click(copyButton);
    expect(screen.getByText('선택된 이미지가 없습니다.')).toBeInTheDocument();
  });

  it('closes resize modal when cancel button is clicked', () => {
    useFileStore.setState({ selectedFiles: new Set(['image1.png']) });
    render(<ImageList />);

    const resizeButton = screen.getByText('크기 조정');
    fireEvent.click(resizeButton);

    const cancelButton = screen.getByText('취소');
    fireEvent.click(cancelButton);

    expect(screen.queryByTestId('mock-resize-modal')).not.toBeInTheDocument();
  });

  it('handles file drop correctly', async () => {
    const mockFile = new File(['dummy content'], 'test.png', {
      type: 'image/png',
    });
    const mockSetFiles = vi.fn();
    useFileStore.setState({ setFiles: mockSetFiles });

    render(<ImageList />);
    const dropzone = screen.getByTestId('image-list');

    await act(async () => {
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [mockFile],
        },
      });
    });

    expect(mockSetFiles).toHaveBeenCalled();
  });

  it('handles image selection correctly', () => {
    const mockSetSelectedFiles = vi.fn();
    useFileStore.setState({
      selectedFiles: new Set(),
      setSelectedFiles: mockSetSelectedFiles,
      coordinates: [
        {
          img: { src: 'image1.png', width: 100, height: 100 },
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        },
      ],
    });
    render(<ImageList />);

    const imageItem = screen.getByRole('button', { name: /Thumbnail 0/ });
    fireEvent.click(imageItem);

    expect(mockSetSelectedFiles).toHaveBeenCalledWith(
      new Set([{ src: 'image1.png', width: 100, height: 100 }])
    );
  });

  it('shows toast when trying to delete with no selection', () => {
    render(<ImageList />);
    const deleteButton = screen.getByText('선택삭제');
    fireEvent.click(deleteButton);
    expect(screen.getByText('선택된 이미지가 없습니다.')).toBeInTheDocument();
  });

  it('handles keyboard navigation for image selection', () => {
    const mockSetSelectedFiles = vi.fn();
    useFileStore.setState({
      selectedFiles: new Set(),
      setSelectedFiles: mockSetSelectedFiles,
      coordinates: [
        {
          img: { src: 'image1.png', width: 100, height: 100 },
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        },
      ],
    });
    render(<ImageList />);

    const imageItem = screen.getByRole('button', { name: /Thumbnail 0/ });
    fireEvent.keyDown(imageItem, { key: 'Enter', code: 'Enter' });

    expect(mockSetSelectedFiles).toHaveBeenCalledWith(
      new Set([{ src: 'image1.png', width: 100, height: 100 }])
    );
  });
});
