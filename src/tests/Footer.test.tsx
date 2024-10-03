import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Footer from '../components/Footer';
import useFileStore from '../../store';
import { FileStore } from '../utils/types';
import { StateCreator, create } from 'zustand';
import {
  cloneSelectedImages,
  inversionSelectedImages,
  rotateSelectedImages,
} from '../utils/imageSelectUtils';

vi.mock('../../store', () => ({
  default: vi.fn(),
}));

vi.mock('../utils/selectionUtils', () => ({
  cloneSelectedImages: vi.fn(),
  inversionSelectedImages: vi.fn(),
  rotateSelectedImages: vi.fn(),
}));

describe('Footer component', () => {
  let mockStore: FileStore;

  const createMockStore = (): StateCreator<FileStore> => set => ({
    files: [],
    padding: 10,
    coordinates: [],
    toast: null,
    selectedFiles: new Set<HTMLImageElement>(),
    fileName: '',
    resizedImage: null,
    history: [],
    redoHistory: [],
    alignElement: 'bin-packing',
    setFiles: vi.fn(),
    setPadding: vi.fn(),
    setCoordinates: vi.fn(),
    setToast: vi.fn(),
    addToast: vi.fn(),
    setSelectedFiles: vi.fn(),
    setFileName: vi.fn(),
    setResizedImage: vi.fn(),
    setAlignElement: vi.fn(),
    addHistory: vi.fn(),
    popHistory: vi.fn(),
    pushHistory: vi.fn(),
  });

  beforeEach(() => {
    const mockStoreCreator = createMockStore();
    const mockUseFileStore = create(mockStoreCreator);
    mockStore = mockUseFileStore.getState();

    vi.mocked(useFileStore).mockImplementation(mockUseFileStore);
  });

  it('적절한 아이콘과 툴팁이 있는 다섯 개의 버튼을 포함합니다', () => {
    render(<Footer />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);

    expect(screen.getByTitle('회전')).toBeInTheDocument();
    expect(screen.getByTitle('반전')).toBeInTheDocument();
    expect(screen.getByTitle('복제')).toBeInTheDocument();
    expect(screen.getByTitle('실행 취소')).toBeInTheDocument();
    expect(screen.getByTitle('다시 실행')).toBeInTheDocument();
  });

  it('각 버튼에 대한 툴팁을 렌더링합니다', () => {
    render(<Footer />);

    expect(screen.getByTitle('회전')).toHaveTextContent('90° 회전');
    expect(screen.getByTitle('반전')).toHaveTextContent('좌우 반전');
    expect(screen.getByTitle('복제')).toHaveTextContent('이미지 복제');
    expect(screen.getByTitle('실행 취소')).toHaveTextContent('실행 취소');
    expect(screen.getByTitle('다시 실행')).toHaveTextContent('다시 실행');
  });

  it('버튼에 올바른 스타일을 적용합니다', () => {
    render(<Footer />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('relative');
      expect(button).toHaveClass('group');
    });
  });

  it('히스토리가 존재할 때 실행 취소 동작을 처리합니다', () => {
    mockStore.history = [[]];
    render(<Footer />);
    const undoButton = screen.getByTitle('실행 취소');
    fireEvent.click(undoButton);

    expect(mockStore.popHistory).toHaveBeenCalled();
  });

  it('다시 실행 히스토리가 존재할 때 다시 실행 동작을 처리합니다', () => {
    mockStore.redoHistory = [[]];
    render(<Footer />);
    const redoButton = screen.getByTitle('다시 실행');
    fireEvent.click(redoButton);

    expect(mockStore.pushHistory).toHaveBeenCalled();
  });

  it('동작을 위해 선택된 파일이 없을 때 토스트를 표시합니다', () => {
    render(<Footer />);
    const cloneButton = screen.getByTitle('복제');
    fireEvent.click(cloneButton);

    expect(mockStore.addToast).toHaveBeenCalledWith(
      '선택된 이미지가 없습니다.'
    );
  });

  it('실행 취소할 히스토리가 없을 때 토스트를 표시합니다', () => {
    render(<Footer />);
    const undoButton = screen.getByTitle('실행 취소');
    fireEvent.click(undoButton);

    expect(mockStore.addToast).toHaveBeenCalledWith(
      '이전 작업 내역이 없습니다.'
    );
  });

  it('다시 실행할 히스토리가 없을 때 토스트를 표시합니다', () => {
    render(<Footer />);
    const redoButton = screen.getByTitle('다시 실행');
    fireEvent.click(redoButton);

    expect(mockStore.addToast).toHaveBeenCalledWith(
      '다시 실행할 작업 내역이 없습니다.'
    );
  });

  it('파일이 선택되었을 때 복제 동작을 처리합니다', () => {
    const mockImg = new Image();
    mockStore.selectedFiles = new Set([mockImg]);
    render(<Footer />);
    const cloneButton = screen.getByTitle('복제');
    fireEvent.click(cloneButton);

    expect(mockStore.addHistory).toHaveBeenCalledWith(mockStore.coordinates);
    expect(cloneSelectedImages).toHaveBeenCalledWith(
      mockStore.coordinates,
      mockStore.selectedFiles,
      mockStore.setCoordinates,
      mockStore.padding,
      mockStore.alignElement
    );
  });

  it('파일이 선택되었을 때 회전 동작을 처리합니다', () => {
    const mockImg = new Image();
    mockStore.selectedFiles = new Set([mockImg]);
    render(<Footer />);
    const rotateButton = screen.getByTitle('회전');
    fireEvent.click(rotateButton);

    expect(mockStore.addHistory).toHaveBeenCalledWith(mockStore.coordinates);
    expect(rotateSelectedImages).toHaveBeenCalledWith(
      mockStore.coordinates,
      mockStore.selectedFiles,
      mockStore.setCoordinates
    );
  });

  it('파일이 선택되었을 때 반전 동작을 처리합니다', () => {
    const mockImg = new Image();
    mockStore.selectedFiles = new Set([mockImg]);
    render(<Footer />);
    const inversionButton = screen.getByTitle('반전');
    fireEvent.click(inversionButton);

    expect(mockStore.addHistory).toHaveBeenCalledWith(mockStore.coordinates);
    expect(inversionSelectedImages).toHaveBeenCalledWith(
      mockStore.coordinates,
      mockStore.selectedFiles,
      mockStore.setCoordinates
    );
  });
});
