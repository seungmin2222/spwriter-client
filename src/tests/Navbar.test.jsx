import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Navbar from '../components/Navbar';
import useFileStore from '../../store';
import { handleFiles } from '../utils/utils';

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
    fireEvent.change(selectElement, { target: { value: 'bin-packing' } });

    expect(selectElement.value).toBe('bin-packing');
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

  it('handles toast disappearance', async () => {
    vi.useFakeTimers();
    const setToast = vi.fn();
    const toast = { id: 1, message: 'Test toast' };
    useFileStore.setState({ toast, setToast });

    render(<Navbar />);

    expect(screen.getByText('Test toast')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(setToast).toHaveBeenCalledWith(null);

    vi.useRealTimers();
  });

  it('shows toast when canvas context cannot be created', async () => {
    const addToast = vi.fn();
    useFileStore.setState({
      coordinates: [{ img: new Image(), width: 50, height: 50, x: 0, y: 0 }],
      addToast,
    });

    document.createElement = element => {
      if (element === 'canvas') {
        const canvas = originalCreateElement.call(document, element);
        canvas.getContext = vi.fn().mockReturnValue(null);
        return canvas;
      }
      return originalCreateElement.call(document, element);
    };

    render(<Navbar />);

    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith(
        'Canvas context를 생성할 수 없습니다.'
      );
    });
  });

  it('calculates correct dimensions for left-right alignment', async () => {
    const coordinates = [
      { img: new Image(), width: 100, height: 150, x: 0, y: 0 },
      { img: new Image(), width: 200, height: 100, x: 0, y: 0 },
      { img: new Image(), width: 150, height: 200, x: 0, y: 0 },
    ];
    const padding = 10;
    useFileStore.setState({
      coordinates,
      padding,
      alignElement: 'left-right',
    });

    let canvasWidth;
    let canvasHeight;
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
        Object.defineProperty(canvas, 'width', {
          set(value) {
            canvasWidth = value;
          },
          get() {
            return canvasWidth;
          },
        });
        Object.defineProperty(canvas, 'height', {
          set(value) {
            canvasHeight = value;
          },
          get() {
            return canvasHeight;
          },
        });
        return canvas;
      }
      return originalCreateElement.call(document, element);
    };

    render(<Navbar />);

    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(canvasWidth).toBe(490);
      expect(canvasHeight).toBe(220);
    });
  });

  it('handles file input changes correctly', async () => {
    const setFiles = vi.fn();
    const setCoordinates = vi.fn();
    const coordinates = [];
    const paddingValue = 10;
    const alignElement = 'bin-packing';

    useFileStore.setState({
      setFiles,
      setCoordinates,
      coordinates,
      padding: paddingValue,
      alignElement,
    });

    render(<Navbar />);

    const fileInput = screen.getByLabelText('Open files');
    const files = [
      new File(['sprite'], 'chucknorris.png', { type: 'image/png' }),
    ];

    Object.defineProperty(fileInput, 'files', {
      value: files,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(handleFiles).toHaveBeenCalledWith(
        files,
        setFiles,
        setCoordinates,
        coordinates,
        paddingValue,
        alignElement
      );
    });
  });
});
