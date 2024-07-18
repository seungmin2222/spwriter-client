import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '../components/Footer';

describe('Footer component', () => {
  it('renders correctly', () => {
    render(<Footer />);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('contains four buttons with appropriate icons', () => {
    render(<Footer />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);

    const rotateIcon = screen.getByAltText('Rotate Icon');
    expect(rotateIcon).toBeInTheDocument();

    const inversion = screen.getByAltText('Inversion Icon');
    expect(inversion).toBeInTheDocument();

    const cloneIcon = screen.getByAltText('Clone Icon');
    expect(cloneIcon).toBeInTheDocument();

    const leftIcon = screen.getByAltText('Left Icon');
    expect(leftIcon).toBeInTheDocument();

    const rightIcon = screen.getByAltText('Right Icon');
    expect(rightIcon).toBeInTheDocument();
  });
});
