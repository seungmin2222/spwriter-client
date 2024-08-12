import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Modal from '../components/Modal';

describe('Modal component', () => {
  const handleClose = vi.fn();
  const handleConfirm = vi.fn();

  beforeEach(() => {
    handleClose.mockClear();
    handleConfirm.mockClear();
  });

  it('renders correctly when showModal is true', () => {
    render(
      <Modal
        showModal
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    );
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('does not render when showModal is false', () => {
    render(
      <Modal
        showModal={false}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    );
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('handles Enter key press', () => {
    render(
      <Modal
        showModal
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    );
    const modal = screen.getByTestId('modal');
    fireEvent.keyDown(modal, { key: 'Enter' });
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('handles Escape key press', () => {
    render(
      <Modal
        showModal
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    );
    const modal = screen.getByTestId('modal');
    fireEvent.keyDown(modal, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
