import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from 'react';
import {
  calculateCoordinates,
  sortAndSetCoordinates,
} from '../utils/coordinateUtils';
import { trimImage } from '../utils/imageProcessing';
import { handleFiles } from '../utils/fileUtils';
import { resizeSelectedImages } from '../utils/imageSelectUtils';
import { PackedImage } from '../utils/types';

interface ImageSize {
  width: number;
  height: number;
}

type PartialCanvasRenderingContext2D = Pick<
  CanvasRenderingContext2D,
  | 'drawImage'
  | 'getImageData'
  | 'translate'
  | 'scale'
  | 'rotate'
  | 'putImageData'
>;

const mockCtx: PartialCanvasRenderingContext2D = {
  drawImage: vi.fn(),
  getImageData: vi.fn(
    (sx: number, sy: number, sw: number, sh: number): ImageData => ({
      data: new Uint8ClampedArray(sw * sh * 4).fill(255),
      width: sw,
      height: sh,
      colorSpace: 'srgb',
    })
  ),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  putImageData: vi.fn(),
};

interface PartialHTMLCanvasElement
  extends Pick<HTMLCanvasElement, 'width' | 'height' | 'toDataURL'> {
  getContext(contextId: '2d'): PartialCanvasRenderingContext2D | null;
}

const mockCanvas: PartialHTMLCanvasElement = {
  getContext: vi.fn((contextId: '2d') => (contextId === '2d' ? mockCtx : null)),
  toDataURL: vi.fn(() => 'data:image/png;base64,mockDataUrl'),
  width: 100,
  height: 100,
};

type HTMLElementOrCanvas = HTMLElement | PartialHTMLCanvasElement;

function createElementMock(tagName: 'canvas'): PartialHTMLCanvasElement;
function createElementMock(tagName: string): HTMLElement;
function createElementMock(tagName: string): HTMLElementOrCanvas {
  if (tagName === 'canvas') return mockCanvas;
  return document.createElement(tagName);
}

global.document.createElement = vi.fn(createElementMock);

interface PartialHTMLImageElement {
  width: number;
  height: number;
  src: string;
  onload: (() => void) | null;
  alt?: string;
  align?: string;
  border?: string;
  complete?: boolean;
}

class MockImage implements PartialHTMLImageElement {
  width: number = 100;
  height: number = 100;
  src: string = '';
  onload: (() => void) | null = null;
  alt: string = '';
  align: string = '';
  border: string = '';
  complete: boolean = false;

  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
      this.complete = true;
    }, 0);
  }
}

declare global {
  interface Global {
    Image: typeof MockImage;
  }
}
(global as Global).Image = MockImage;

global.window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.window.URL.revokeObjectURL = vi.fn();

global.HTMLAnchorElement.prototype.click = vi.fn();

const imageSizeToHTMLImageElement = (
  imageSize: ImageSize
): HTMLImageElement => {
  const img = new Image();
  img.width = imageSize.width;
  img.height = imageSize.height;
  return img;
};

describe('Image Processing Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateCoordinates', () => {
    it('bin-packing 정렬을 위한 좌표를 계산해야 합니다', () => {
      const images: ImageSize[] = [
        { width: 100, height: 100 },
        { width: 50, height: 50 },
        { width: 75, height: 75 },
      ];
      const fileName: string[] = ['img-0', 'img-1', 'img-2'];

      const htmlImages = images.map(imageSizeToHTMLImageElement);
      const result = calculateCoordinates(
        htmlImages,
        fileName,
        10,
        'bin-packing'
      );
      expect(result).toHaveLength(3);
      expect(result[0].x).toBeDefined();
      expect(result[0].y).toBeDefined();

      result.forEach(item => {
        expect(typeof item.width).toBe('number');
        expect(typeof item.height).toBe('number');
        expect(typeof item.x).toBe('number');
        expect(typeof item.y).toBe('number');
      });
    });

    it('top-bottom 정렬을 위한 좌표를 계산해야 합니다', () => {
      const images: ImageSize[] = [
        { width: 100, height: 100 },
        { width: 50, height: 50 },
      ];
      const fileName: string[] = ['img-0', 'img-1', 'img-2'];
      const htmlImages = images.map(imageSizeToHTMLImageElement);

      const result = calculateCoordinates(
        htmlImages,
        fileName,
        10,
        'top-bottom'
      );
      expect(result).toHaveLength(2);
      expect(result[1].y).toBeGreaterThan(result[0].y);
    });

    it('left-right 정렬을 위한 좌표를 계산해야 합니다', () => {
      const images: ImageSize[] = [
        { width: 100, height: 100 },
        { width: 50, height: 50 },
      ];
      const fileName: string[] = ['img-0', 'img-1', 'img-2'];
      const htmlImages = images.map(imageSizeToHTMLImageElement);
      const result = calculateCoordinates(
        htmlImages,
        fileName,
        10,
        'left-right'
      );
      expect(result).toHaveLength(2);
      expect(result[1].x).toBeGreaterThan(result[0].x);
    });
  });

  describe('sortAndSetCoordinates', () => {
    it('좌표를 면적별로 정렬하고 설정해야 합니다', () => {
      const coords: PackedImage[] = [
        {
          img: imageSizeToHTMLImageElement({ width: 50, height: 50 }),
          fileName: 'img-0',
          width: 50,
          height: 50,
          x: 0,
          y: 0,
          rotated: false,
        },
        {
          img: imageSizeToHTMLImageElement({ width: 50, height: 50 }),
          fileName: 'img-1',
          width: 100,
          height: 100,
          x: 0,
          y: 0,
          rotated: false,
        },
        {
          img: imageSizeToHTMLImageElement({ width: 50, height: 50 }),
          fileName: 'img-3',
          width: 75,
          height: 75,
          x: 0,
          y: 0,
          rotated: false,
        },
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
      const img = imageSizeToHTMLImageElement({ width: 100, height: 100 });
      const result = await trimImage(img);
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
      expect(result.src).toBe('data:image/png;base64,mockDataUrl');
    });
  });

  describe('handleFiles', () => {
    it('파일 업로드를 처리해야 합니다', async () => {
      const files = [new File([''], 'test.png', { type: 'image/png' })];
      const setFiles = vi.fn();
      const setCoordinates = vi.fn();
      const coordinates: PackedImage[] = [];
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
      const coordinates: PackedImage[] = [
        {
          img: imageSizeToHTMLImageElement({ width: 100, height: 100 }),
          fileName: 'img-0',
          width: 100,
          height: 100,
          x: 0,
          y: 0,
          rotated: false,
        },
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
