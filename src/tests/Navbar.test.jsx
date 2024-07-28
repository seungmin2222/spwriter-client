import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Navbar from '../components/Navbar';
import useFileStore from '../../store';

vi.mock('../utils/utils', () => ({
  handleFiles: vi.fn(),
  trimImage: vi.fn().mockResolvedValue(new Image()),
}));

describe('Navbar', () => {
  const originalCreateElement = document.createElement;

  beforeEach(() => {
    useFileStore.setState({
      setPadding: vi.fn(),
      coordinates: [],
      addToast: vi.fn(),
      setFiles: vi.fn(),
      setCoordinates: vi.fn(),
      padding: 10,
      canvasRef: { current: document.createElement('canvas') },
      toast: null,
      setToast: vi.fn(),
    });

    document.createElement = element => {
      if (element === 'canvas') {
        const canvas = originalCreateElement.call(document, element);
        canvas.getContext = vi.fn().mockReturnValue({
          clearRect: vi.fn(),
          drawImage: vi.fn(),
        });
        canvas.toDataURL = vi
          .fn()
          .mockReturnValue('data:image/png;base64,test');
        return canvas;
      }
      return originalCreateElement.call(document, element);
    };
  });

  it('renders correctly', () => {
    render(<Navbar />);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Open files')).toBeInTheDocument();
    expect(screen.getByText('Padding :')).toBeInTheDocument();
    expect(screen.getByText('정렬 옵션 :')).toBeInTheDocument();
  });

  it('calls setPadding on padding input change', () => {
    const setPadding = vi.fn();
    useFileStore.setState({ setPadding });

    render(<Navbar />);

    const paddingInput = screen.getByLabelText('Padding :');
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
    const addToast = vi.fn();
    useFileStore.setState({ coordinates: [], addToast });

    render(<Navbar />);

    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);

    expect(addToast).toHaveBeenCalledWith('다운로드할 이미지가 없습니다.');
  });

  it('renders Align-elements options correctly', () => {
    render(<Navbar />);

    const selectElement = screen.getByLabelText('정렬 옵션 :');
    const options = selectElement.querySelectorAll('option');

    expect(options).toHaveLength(3);
    expect(options[0].value).toBe('bin-packing');
    expect(options[1].value).toBe('left-right');
    expect(options[2].value).toBe('top-bottom');
  });

  it('displays an error message when padding value is set to less than 1', () => {
    const addToast = vi.fn();
    useFileStore.setState({ addToast });

    render(<Navbar />);

    const paddingInput = screen.getByLabelText('Padding :');
    fireEvent.change(paddingInput, { target: { value: '0' } });

    expect(addToast).toHaveBeenCalledWith(
      'Padding 값은 1보다 작을 수 없습니다.'
    );
  });

  it('sets the selected option for align-elements', () => {
    render(<Navbar />);

    const selectElement = screen.getByLabelText('정렬 옵션 :');
    fireEvent.change(selectElement, { target: { value: 'top-bottom' } });

    expect(selectElement.value).toBe('top-bottom');
  });

  it('handles file download with coordinates', async () => {
    const coordinates = [
      {
        img: new Image(),
        width: 50,
        height: 50,
        x: 0,
        y: 0,
      },
    ];
    useFileStore.setState({ coordinates });

    render(<Navbar />);

    const fileNameInput =
      screen.getByPlaceholderText(/파일 이름을 입력해주세요./i);
    fireEvent.change(fileNameInput, { target: { value: 'test-file' } });

    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      const link = document.createElement('a');
      link.href = 'data:image/png;base64,test';
      link.download = 'test-file.png';
      link.click();
    });
  });

  it('handles toast close', () => {
    const setToast = vi.fn();
    const toast = { id: 1, message: 'Test toast' };
    useFileStore.setState({ toast, setToast });

    render(<Navbar />);

    const toastCloseButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(toastCloseButton);

    expect(setToast).toHaveBeenCalledWith(null);
  });
});
