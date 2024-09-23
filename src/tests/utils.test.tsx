import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from 'react';
import {
  calculateCoordinates,
  sortAndSetCoordinates,
  trimImage,
  handleFiles,
  resizeSelectedImages,
} from '../utils/utils';

const mockCtx = {
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(100 * 100 * 4).fill(255),
  })),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  putImageData: vi.fn(),
};

const mockCanvas = {
  getContext: vi.fn(() => mockCtx),
  toDataURL: vi.fn(() => 'data:image/png;base64,mockDataUrl'),
  width: 100,
  height: 100,
};

global.document.createElement = vi.fn(tagName => {
  if (tagName === 'canvas') return mockCanvas;
  return document.createElement(tagName);
});

global.Image = class {
  constructor() {
    this.width = 100;
    this.height = 100;
    setTimeout(() => this.onload?.(), 0);
  }

  src = '';
};

global.window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.window.URL.revokeObjectURL = vi.fn();

global.HTMLAnchorElement.prototype.click = vi.fn();

describe('Image Processing Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateCoordinates', () => {
    it('bin-packing 정렬을 위한 좌표를 계산해야 합니다', () => {
      const images = [
        { width: 100, height: 100 },
        { width: 50, height: 50 },
        { width: 75, height: 75 },
      ];
      const result = calculateCoordinates(images, 10, 'bin-packing');
      expect(result).toHaveLength(3);
      expect(result[0].x).toBeDefined();
      expect(result[0].y).toBeDefined();
    });

    it('top-bottom 정렬을 위한 좌표를 계산해야 합니다', () => {
      const images = [
        { width: 100, height: 100 },
        { width: 50, height: 50 },
      ];
      const result = calculateCoordinates(images, 10, 'top-bottom');
      expect(result).toHaveLength(2);
      expect(result[1].y).toBeGreaterThan(result[0].y);
    });

    it('left-right 정렬을 위한 좌표를 계산해야 합니다', () => {
      const images = [
        { width: 100, height: 100 },
        { width: 50, height: 50 },
      ];
      const result = calculateCoordinates(images, 10, 'left-right');
      expect(result).toHaveLength(2);
      expect(result[1].x).toBeGreaterThan(result[0].x);
    });
  });

  describe('sortAndSetCoordinates', () => {
    it('좌표를 면적별로 정렬하고 설정해야 합니다', () => {
      const coords = [
        { width: 50, height: 50 },
        { width: 100, height: 100 },
        { width: 75, height: 75 },
      ];
      const setCoordinates = vi.fn();
      sortAndSetCoordinates(coords, setCoordinates);
      expect(setCoordinates).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ width: 100, height: 100 }),
          expect.objectContaining({ width: 75, height: 75 }),
          expect.objectContaining({ width: 50, height: 50 }),
        ])
      );
    });
  });

  describe('trimImage', () => {
    it('이미지를 트리밍해야 합니다', async () => {
      const img = new Image();
      const result = await trimImage(img);
      expect(result).toBeInstanceOf(Image);
      expect(result.src).toBe('data:image/png;base64,mockDataUrl');
    });
  });

  describe('handleFiles', () => {
    it('파일 업로드를 처리해야 합니다', async () => {
      const files = [new File([''], 'test.png', { type: 'image/png' })];
      const setFiles = vi.fn();
      const setCoordinates = vi.fn();
      const coordinates = [];
      await act(async () => {
        await handleFiles(
          files,
          setFiles,
          setCoordinates,
          coordinates,
          10,
          'bin-packing'
        );
      });
      expect(setFiles).toHaveBeenCalled();
      expect(setCoordinates).toHaveBeenCalled();
    });
  });

  describe('resizeSelectedImages', () => {
    it('선택된 이미지의 크기를 조정해야 합니다', async () => {
      const coordinates = [
        { img: new Image(), width: 100, height: 100, x: 0, y: 0 },
      ];
      const selectedFiles = new Set([coordinates[0].img]);
      const setCoordinates = vi.fn();
      const setSelectedFiles = vi.fn();
      await act(async () => {
        const result = await resizeSelectedImages(
          coordinates,
          selectedFiles,
          setCoordinates,
          setSelectedFiles
        );
        expect(setCoordinates).toHaveBeenCalled();
        expect(setSelectedFiles).toHaveBeenCalled();
        expect(result).toHaveProperty('newCoordinates');
        expect(result).toHaveProperty('resizedImage');
      });
    });
  });
});
