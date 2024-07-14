import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SpriteEditor } from '../components/SpriteEditor';

test('renders Footer in SpriteEditor', () => {
  render(<SpriteEditor />);

  expect(screen.getByTestId('footer')).toBeInTheDocument();
});
