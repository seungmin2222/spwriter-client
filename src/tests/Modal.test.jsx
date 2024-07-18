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
        showModal={true}
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
        showModal={true}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    );
    fireEvent.click(screen.getByTestId('modal'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('does not propagate click event when content is clicked', () => {
    render(
      <Modal
        showModal={true}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    );
    const modalContent = screen.getByTestId('modal').firstChild;
    fireEvent.click(modalContent);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('calls handleClose when "No" button is clicked', () => {
    render(
      <Modal
        showModal={true}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    );
    fireEvent.click(screen.getByText('No'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls handleConfirm when "Yes" button is clicked', () => {
    render(
      <Modal
        showModal={true}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    );
    fireEvent.click(screen.getByText('Yes'));
    expect(handleConfirm).toHaveBeenCalled();
  });

  it('calls handleClose when "Escape" key is pressed', () => {
    render(
      <Modal
        showModal={true}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    );
    fireEvent.keyDown(screen.getByTestId('modal'), {
      key: 'Escape',
      code: 'Escape',
    });
    expect(handleClose).toHaveBeenCalled();
  });

  it('handles click event on modal background and content correctly', () => {
    render(
      <Modal
        showModal={true}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    );
    const modalBackground = screen.getByTestId('modal');
    const modalContent = screen.getByText(
      'Are you sure you want to delete the image file?'
    ).parentElement;

    fireEvent.click(modalBackground);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.click(modalContent);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
