import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SpriteMain from '../components/SpriteMain';

describe('SpriteMain', () => {
  it('SpriteMain에서 Navbar와 SpriteEditor를 렌더링합니다', () => {
    render(<SpriteMain />);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('sprite-editor')).toBeInTheDocument();
  });
});
