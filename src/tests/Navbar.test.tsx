import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Navbar from '../components/Navbar';
import useFileStore from '../../store';
import { handleFiles } from '../utils/utils';

interface PackedImage {
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
}

vi.mock('../utils/utils', () => ({
  handleFiles: vi.fn(),
  trimImage: vi.fn().mockResolvedValue(new Image()),
}));

describe('Navbar', () => {
  const originalCreateElement = document.createElement;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:test');
    URL.revokeObjectURL = vi.fn();

    const windowWithLocation = window as Window & { location: Location };
    windowWithLocation.location = { href: '' } as Location;
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('입력 변경 시 fileName 상태를 업데이트합니다', () => {
    render(<Navbar />);

    const fileNameInput = screen.getByPlaceholderText(
      /파일 이름을 입력해주세요./i
    ) as HTMLInputElement;
    fireEvent.change(fileNameInput, { target: { value: 'test-file' } });

    expect(fileNameInput.value).toBe('test-file');
  });

  it('좌표가 없을 때 다운로드 버튼 클릭 시 알림을 표시합니다', () => {
    const addToast = vi.fn();
    useFileStore.setState({ coordinates: [], addToast });

    render(<Navbar />);

    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);

    expect(addToast).toHaveBeenCalledWith('다운로드할 이미지가 없습니다.');
  });

  it('정렬 요소 옵션을 올바르게 렌더링합니다', () => {
    render(<Navbar />);

    const selectElement = screen.getByLabelText(
      '정렬 옵션 :'
    ) as HTMLSelectElement;
    const options = selectElement.querySelectorAll('option');

    expect(options).toHaveLength(3);
    expect(options[0].value).toBe('bin-packing');
    expect(options[1].value).toBe('left-right');
    expect(options[2].value).toBe('top-bottom');
  });

  it('패딩 값이 1 미만으로 설정될 때 오류 메시지를 표시합니다', () => {
    const addToast = vi.fn();
    useFileStore.setState({ addToast });

    render(<Navbar />);

    const paddingInput = screen.getByLabelText('Padding :') as HTMLInputElement;
    fireEvent.change(paddingInput, { target: { value: '0' } });

    expect(addToast).toHaveBeenCalledWith(
      'Padding 값은 1보다 작을 수 없습니다.'
    );
  });

  it('정렬 요소에 대해 선택된 옵션을 설정합니다', () => {
    render(<Navbar />);

    const selectElement = screen.getByLabelText(
      '정렬 옵션 :'
    ) as HTMLSelectElement;
    fireEvent.change(selectElement, { target: { value: 'bin-packing' } });

    expect(selectElement.value).toBe('bin-packing');
  });

  it('토스트 사라짐을 처리합니다', async () => {
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

  it('캔버스 컨텍스트를 생성할 수 없을 때 토스트를 표시합니다', async () => {
    const addToast = vi.fn();
    useFileStore.setState({
      coordinates: [
        { img: new Image(), width: 50, height: 50, x: 0, y: 0, rotated: false },
      ],
      addToast,
    });

    document.createElement = ((element: string) => {
      if (element === 'canvas') {
        const canvas = originalCreateElement.call(
          document,
          element
        ) as HTMLCanvasElement;
        canvas.getContext = vi.fn().mockReturnValue(null);
        return canvas;
      }
      return originalCreateElement.call(document, element);
    }) as typeof document.createElement;

    render(<Navbar />);

    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith(
        'Canvas context를 생성할 수 없습니다.'
      );
    });
  });

  it('파일 입력 변경을 올바르게 처리합니다', async () => {
    const setFiles = vi.fn();
    const setCoordinates = vi.fn();
    const coordinates: PackedImage[] = [];
    const paddingValue = 10;
    const alignElement = 'bin-packing' as const;

    useFileStore.setState({
      setFiles,
      setCoordinates,
      coordinates,
      padding: paddingValue,
      alignElement,
    });

    render(<Navbar />);

    const fileInput = screen.getByLabelText('Open files') as HTMLInputElement;
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
