import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageList } from '../components/ImageList';
import { useFileStore } from '../../store';

vi.mock('../components/Modal', () => ({
  Modal: ({ showModal }) => {
    return showModal ? <div data-testid="modal">Modal Content</div> : null;
  },
}));

describe('ImageList component', () => {
  beforeEach(() => {
    useFileStore.setState({
      coordinates: [
        {
          img: { src: 'image1.png' },
          width: 100,
          height: 100,
          x: 0,
          y: 0,
        },
        {
          img: { src: 'image2.png' },
          width: 200,
          height: 200,
          x: 100,
          y: 0,
        },
      ],
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
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('renders the image list correctly', () => {
    render(<ImageList />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'image1.png');
    expect(images[1]).toHaveAttribute('src', 'image2.png');
  });
});
