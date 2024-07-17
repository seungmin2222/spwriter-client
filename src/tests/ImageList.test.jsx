import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ImageList from '../components/ImageList';
import useFileStore from '../../store';

// Modal 컴포넌트 모킹
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
    useFileStore.setState({
      coordinates: [
        { img: { src: 'image1.png' }, width: 50, height: 50, x: 0, y: 0 },
        { img: { src: 'image2.png' }, width: 50, height: 50, x: 0, y: 0 },
      ],
      setCoordinates: vi.fn(),
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
});
