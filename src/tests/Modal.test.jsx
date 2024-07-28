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

  it('calls handleClose when background is clicked', () => {
    render(
      <Modal
        showModal
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    );
    fireEvent.click(screen.getByTestId('modal'));
    expect(handleClose).toHaveBeenCalled();
  });
});
