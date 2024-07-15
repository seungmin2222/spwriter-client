import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { ImageList } from '../components/ImageList';

describe('ImageList', () => {
  it('displays modal when cross button is clicked', () => {
    render(<ImageList />);

    const crossButton = screen.getByRole('button', { name: /cross/i });

    fireEvent.click(crossButton);

    const modalText = screen.getByText(
      /are you sure you want to delete the image file\?/i
    );
    expect(modalText).toBeInTheDocument();

    const noButton = screen.getByRole('button', { name: /no/i });
    const yesButton = screen.getByRole('button', { name: /yes/i });
    expect(noButton).toBeInTheDocument();
    expect(yesButton).toBeInTheDocument();
  });
});
