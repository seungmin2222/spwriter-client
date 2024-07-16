import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '../components/Navbar';
import { useFileStore } from '../../store';

describe('Navbar', () => {
  it('renders correctly', () => {
    render(<Navbar />);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Open files')).toBeInTheDocument();
    expect(screen.getByText('Padding :')).toBeInTheDocument();
    expect(screen.getByText('Align-elements :')).toBeInTheDocument();
  });

  it('calls setPadding on padding input change', () => {
    const setPadding = vi.fn();
    useFileStore.setState({ setPadding });

    render(<Navbar />);

    const paddingInput = screen.getByRole('spinbutton');
    fireEvent.change(paddingInput, { target: { value: '20' } });

    expect(setPadding).toHaveBeenCalledWith(20);
  });

  it('updates fileName state on input change', () => {
    render(<Navbar />);

    const fileNameInput =
      screen.getByPlaceholderText(/원하시는 파일 이름을 입력해주세요./i);
    fireEvent.change(fileNameInput, { target: { value: 'test-file' } });

    expect(fileNameInput.value).toBe('test-file');
  });

  it('alerts when download button is clicked with no coordinates', () => {
    const addToast = vi.fn();
    useFileStore.setState({ coordinates: [], addToast });

    render(<Navbar />);

    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);

    expect(addToast).toHaveBeenCalledWith('다운로드할 이미지가 없습니다.');
  });

  it('renders Align-elements options correctly', () => {
    render(<Navbar />);

    const selectElement = screen.getByLabelText('Align-elements :');
    const options = selectElement.querySelectorAll('option');

    expect(options).toHaveLength(3);
    expect(options[0].value).toBe('Binary Tree');
    expect(options[1].value).toBe('left-right');
    expect(options[2].value).toBe('top-bottom');
  });

  it('displays an error message when padding value is set to less than 1', () => {
    const addToast = vi.fn();
    useFileStore.setState({ addToast });

    render(<Navbar />);

    const paddingInput = screen.getByRole('spinbutton');
    fireEvent.change(paddingInput, { target: { value: '0' } });

    expect(addToast).toHaveBeenCalledWith('1 보다 작게 설정 할 수 없습니다.');
  });
});
