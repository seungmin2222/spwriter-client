import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { Navbar } from '../components/Navbar';
import { useFileStore } from '../../store';

describe('Navbar', () => {
  it('renders correctly', () => {
    render(<Navbar />);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Open files')).toBeInTheDocument();
    expect(screen.getByText('Padding between elements :')).toBeInTheDocument();
    expect(screen.getByText('Align-elements :')).toBeInTheDocument();
  });

  it('calls setFiles on file input change', () => {
    const setFiles = vi.fn();
    useFileStore.setState({ setFiles });

    render(<Navbar />);

    const fileInput = screen.getByLabelText(/open files/i);
    const file = new File(['dummy content'], 'example.png', {
      type: 'image/png',
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(setFiles).toHaveBeenCalledWith([file]);
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
      screen.getByPlaceholderText(/파일 이름을 입력해주세요./i);
    fireEvent.change(fileNameInput, { target: { value: 'test-file' } });

    expect(fileNameInput.value).toBe('test-file');
  });

  it('alerts when download button is clicked with no coordinates', () => {
    global.alert = vi.fn();

    render(<Navbar />);

    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);

    expect(global.alert).toHaveBeenCalledWith('다운로드할 이미지가 없습니다.');
  });
});
