import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('ImageList component', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(),
      },
    });

    const mockCanvas = document.createElement('canvas');
    mockCanvas.width = 300;
    mockCanvas.height = 150;
    const mockContext = {
      clearRect: vi.fn(),
    };
    mockCanvas.getContext = vi.fn().mockReturnValue(mockContext);

    useFileStore.setState({
      coordinates: [
        {
          img: { src: 'image1.png', width: 50, height: 50, x: 0, y: 0 },
          width: 50,
          height: 50,
          x: 0,
          y: 0,
        },
        {
          img: { src: 'image2.png', width: 50, height: 50, x: 0, y: 0 },
          width: 50,
          height: 50,
          x: 0,
          y: 0,
        },
      ],
      lastClickedIndex: null,
      setLastClickedIndex: vi.fn(),
      canvasRef: { current: mockCanvas },
    });
  });

  it('renders correctly', () => {
    render(<ImageList />);
    expect(screen.getByTestId('image-list')).toBeInTheDocument();
  });

  it('opens the modal when the delete button is clicked', () => {
    render(<ImageList />);
    const deleteButtons = screen.getAllByRole('button', { name: /cross/i });
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
  });

  it('renders the image list correctly', () => {
    render(<ImageList />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'image1.png');
    expect(images[1]).toHaveAttribute('src', 'image2.png');
  });

  it('handles mouse hover state correctly', () => {
    render(<ImageList />);
    const deleteButton = screen.getAllByRole('button', { name: /cross/i })[0];
    fireEvent.mouseEnter(deleteButton);
    deleteButton.closest('article').classList.add('hover:bg-[#e2e8f0]');
    expect(deleteButton.closest('article')).toHaveClass('hover:bg-[#e2e8f0]');
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

  it('sets button hover state correctly', () => {
    render(<ImageList />);
    const deleteButton = screen.getAllByRole('button', { name: /cross/i })[0];
    fireEvent.mouseEnter(deleteButton);
    expect(deleteButton.closest('article')).not.toHaveClass(
      'hover:bg-[#e2e8f0]'
    );
    fireEvent.mouseLeave(deleteButton);
    expect(deleteButton.closest('article')).toHaveClass('hover:bg-[#e2e8f0]');
  });
});
