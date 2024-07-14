// src/tests/SpriteMain.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SpriteMain } from '../components/SpriteMain';

test('renders Navbar and SpriteEditor in SpriteMain', () => {
  render(<SpriteMain />);

  expect(screen.getByTestId('navbar')).toBeInTheDocument();

  expect(screen.getByTestId('sprite-editor')).toBeInTheDocument();
});
