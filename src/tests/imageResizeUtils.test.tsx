import { describe, it, expect, vi } from 'vitest';
import handleResizeConfirmUtil from '../utils/imageResizeUtils';
import { PackedImage } from '../utils/types';

describe('handleResizeConfirmUtil', () => {
  it('너비 또는 높이가 잘못된 경우 토스트 메시지를 보여줘야 합니다.', () => {
    const generateToast = vi.fn();
    const setCoordinates = vi.fn();
    const setSelectedFiles = vi.fn();
    const setResizeModalOpen = vi.fn();
    const setModalWidth = vi.fn();
    const setModalHeight = vi.fn();
    const addHistory = vi.fn();

    const modalWidth = '0';
    const modalHeight = '-10';
    const coordinates: PackedImage[] = [];
    const selectedFiles = new Set<HTMLImageElement>();
    const padding = 0;
    const alignElement = 'bin-packing';

    handleResizeConfirmUtil(
      modalWidth,
      modalHeight,
      coordinates,
      selectedFiles,
      addHistory,
      setCoordinates,
      setSelectedFiles,
      setResizeModalOpen,
      setModalWidth,
      setModalHeight,
      generateToast,
      padding,
      alignElement
    );

    expect(generateToast).toHaveBeenCalledWith(
      '유효한 너비와 높이를 입력해주세요.'
    );
    expect(setCoordinates).not.toHaveBeenCalled();
    expect(setSelectedFiles).not.toHaveBeenCalled();
  });
});
