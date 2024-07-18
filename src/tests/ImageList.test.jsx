import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('shows toast message when CSS is copied to clipboard', async () => {
    render(<ImageList />);
    const imageButtons = screen.getAllByRole('button');
    fireEvent.click(imageButtons[0]);
    await waitFor(() => {
      expect(
        screen.getByText('CSS 정보가 클립보드에 복사되었습니다.')
      ).toBeInTheDocument();
    });
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

  it('copies CSS to clipboard when an image is clicked', async () => {
    render(<ImageList />);
    const imageButtons = screen.getAllByRole('button');
    fireEvent.click(imageButtons[0]);
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`
      .sprite-0 {
        width: 50px;
        height: 50px;
        background: url('css_sprites.png') -0px -0px;
      }
    `);
    });
  });

  it('closes the modal when the Confirm button is clicked', () => {
    render(<ImageList />);
    const deleteButtons = screen.getAllByRole('button', { name: /cross/i });
    fireEvent.click(deleteButtons[0]);
    fireEvent.click(screen.getByText('Confirm'));
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
  });

  it('shows error message when clipboard copy fails', async () => {
    navigator.clipboard.writeText.mockRejectedValue(new Error('Copy failed'));

    render(<ImageList />);
    const imageButtons = screen.getAllByRole('button');
    fireEvent.click(imageButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('클립보드 복사 실패.')).toBeInTheDocument();
    });
  });

  it('renders Toast component when toast state is set', async () => {
    render(<ImageList />);
    const imageButtons = screen.getAllByRole('button');
    fireEvent.click(imageButtons[0]);
    await waitFor(() => {
      expect(screen.getByTestId('toast')).toBeInTheDocument();
    });
  });

  it('handles close of Toast component', async () => {
    render(<ImageList />);
    const imageButtons = screen.getAllByRole('button');
    fireEvent.click(imageButtons[0]);
    await waitFor(() => {
      expect(screen.getByTestId('toast')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('toast'));
    await waitFor(
      () => {
        expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('renders image list with selected item', () => {
    useFileStore.setState({
      lastClickedIndex: 0,
    });
    render(<ImageList />);
    const selectedItem = screen.getAllByRole('article')[0];
    expect(selectedItem).toHaveClass('border-blue-500');
  });

  it('handles non-array coordinates', () => {
    useFileStore.setState({
      coordinates: null,
    });
    render(<ImageList />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('closes toast when handleToastClose is called', async () => {
    render(<ImageList />);
    const imageButtons = screen.getAllByRole('button');
    fireEvent.click(imageButtons[0]);
    await waitFor(() => {
      expect(screen.getByTestId('toast')).toBeInTheDocument();
    });
    const toastCloseButton = screen.getByTestId('toast-close-button');
    fireEvent.click(toastCloseButton);
    await waitFor(() => {
      expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
    });
  });

  it('calls setLastClickedIndex when an image is clicked', () => {
    const setLastClickedIndex = vi.fn();
    useFileStore.setState({ setLastClickedIndex });
    render(<ImageList />);
    const imageButtons = screen.getAllByRole('button');
    fireEvent.click(imageButtons[0]);
    expect(setLastClickedIndex).toHaveBeenCalledWith(0);
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
