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

  it('isOpen이 true일 때 올바르게 렌더링됩니다', () => {
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

  it('isOpen이 false일 때 렌더링되지 않습니다', () => {
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

  it('확인 버튼 클릭 시 onConfirm을 호출합니다', () => {
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

  it('취소 버튼 클릭 시 onClose를 호출합니다', () => {
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

  it('너비 입력 변경 시 setWidth를 호출합니다', () => {
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

  it('높이 입력 변경 시 setHeight를 호출합니다', () => {
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

  it('Enter 키 입력 시 onConfirm을 호출합니다', () => {
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

  it('Escape 키 입력 시 onClose를 호출합니다', () => {
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
