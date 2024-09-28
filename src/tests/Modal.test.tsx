import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Modal } from '../components/Modal';

describe('Modal component', () => {
  const handleClose = vi.fn();
  const handleConfirm = vi.fn();
  const testMessage = '테스트 메시지';

  beforeEach(() => {
    handleClose.mockClear();
    handleConfirm.mockClear();
  });

  it('showModal이 true일 때 올바르게 렌더링됩니다', () => {
    render(
      <Modal
        showModal
        handleClose={handleClose}
        handleConfirm={handleConfirm}
        message={testMessage}
      />
    );
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('showModal이 false일 때 렌더링되지 않습니다', () => {
    render(
      <Modal
        showModal={false}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
        message={testMessage}
      />
    );
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('Enter 키 입력을 처리합니다', () => {
    render(
      <Modal
        showModal
        handleClose={handleClose}
        handleConfirm={handleConfirm}
        message={testMessage}
      />
    );
    const modal = screen.getByTestId('modal');
    fireEvent.keyDown(modal, { key: 'Enter' });
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('Escape 키 입력을 처리합니다', () => {
    render(
      <Modal
        showModal
        handleClose={handleClose}
        handleConfirm={handleConfirm}
        message={testMessage}
      />
    );
    const modal = screen.getByTestId('modal');
    fireEvent.keyDown(modal, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
