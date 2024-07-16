import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { Footer } from '../components/Footer';

describe('Footer component', () => {
  it('renders correctly', () => {
    render(<Footer />);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('contains four buttons with appropriate icons', () => {
    render(<Footer />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);

    const rotateIcon = screen.getByAltText('Rotate Icon');
    expect(rotateIcon).toBeInTheDocument();

    const cloneIcon = screen.getByAltText('Clone Icon');
    expect(cloneIcon).toBeInTheDocument();

    const leftIcon = screen.getByAltText('Left Icon');
    expect(leftIcon).toBeInTheDocument();

    const rightIcon = screen.getByAltText('Right Icon');
    expect(rightIcon).toBeInTheDocument();
  });

  it('applies the correct styles to the buttons', () => {
    render(<Footer />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass(
        'p-2 rounded-full bg-[#1f77b4] text-white hover:bg-[#1a5a91] transition-colors duration-300'
      );
    });
  });
});
