import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ResizeModal from '../components/ResizeModal';

describe('ResizeModal component', () => {
  const onClose = vi.fn();
  const onConfirm = vi.fn();
  const setWidth = vi.fn();
  const setHeight = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <ResizeModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        setWidth={setWidth}
        setHeight={setHeight}
      />
    );
    expect(
      screen.getByText('이미지 크기를 조정하시겠습니까?')
    ).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <ResizeModal
        isOpen={false}
        onClose={onClose}
        onConfirm={onConfirm}
        setWidth={setWidth}
        setHeight={setHeight}
      />
    );
    expect(
      screen.queryByText('이미지 크기를 조정하시겠습니까?')
    ).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(
      <ResizeModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        setWidth={setWidth}
        setHeight={setHeight}
      />
    );
    fireEvent.click(screen.getByText('확인'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <ResizeModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        setWidth={setWidth}
        setHeight={setHeight}
      />
    );
    fireEvent.click(screen.getByText('취소'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls setWidth when width input changes', () => {
    render(
      <ResizeModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        setWidth={setWidth}
        setHeight={setHeight}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('새 너비'), {
      target: { value: '100' },
    });
    expect(setWidth).toHaveBeenCalledWith('100');
  });

  it('calls setHeight when height input changes', () => {
    render(
      <ResizeModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        setWidth={setWidth}
        setHeight={setHeight}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('새 높이'), {
      target: { value: '200' },
    });
    expect(setHeight).toHaveBeenCalledWith('200');
  });

  it('calls onConfirm when Enter key is pressed', () => {
    render(
      <ResizeModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        setWidth={setWidth}
        setHeight={setHeight}
      />
    );
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    render(
      <ResizeModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        setWidth={setWidth}
        setHeight={setHeight}
      />
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
