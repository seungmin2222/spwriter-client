import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../components/App';

describe('App component', () => {
  it('renders correctly', () => {
    render(<App />);
    expect(screen.getByTestId('app')).toBeInTheDocument();
  });

  it('contains the ImageList component', () => {
    render(<App />);
    expect(screen.getByTestId('image-list')).toBeInTheDocument();
  });

  it('contains the SpriteMain component', () => {
    render(<App />);
    expect(screen.getByTestId('sprite-main')).toBeInTheDocument();
  });
});
