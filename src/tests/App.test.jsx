import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import App from '../components/App';

describe('App component', () => {
  const originalUserAgent = window.navigator.userAgent;

  beforeEach(() => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    });
  });

  it('올바르게 렌더링됩니다', () => {
    render(<App />);
    expect(screen.getByTestId('app')).toBeInTheDocument();
  });

  it('ImageList 컴포넌트를 포함합니다', () => {
    render(<App />);
    expect(screen.getByTestId('image-list')).toBeInTheDocument();
  });

  it('SpriteMain 컴포넌트를 포함합니다', () => {
    render(<App />);
    expect(screen.getByTestId('sprite-main')).toBeInTheDocument();
  });

  it('모바일 기기에서 모바일 메시지를 표시합니다', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
      configurable: true,
    });

    render(<App />);
    expect(
      screen.getByText((content, element) => {
        return (
          element.tagName.toLowerCase() === 'h1' &&
          content.includes('죄송합니다.') &&
          content.includes('모바일은 지원하지 않습니다.')
        );
      })
    ).toBeInTheDocument();
    expect(screen.getByAltText('xMarkIcon Icon')).toBeInTheDocument();
  });
});
