import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleFiles } from '../utils/utils';

beforeEach(() => {
  vi.useFakeTimers();

  global.HTMLCanvasElement.prototype.getContext = () => ({
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray([255, 255, 255, 255]),
      width: 1,
      height: 1,
    })),
    fillRect: vi.fn(),
  });

  global.FileReader = vi.fn(function () {
    this.readAsDataURL = vi.fn(() => {
      setTimeout(() => this.onload && this.onload(), 0);
    });
    this.result =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/ur6TYQAAAAASUVORK5CYII=';
    this.onload = null;
  });

  global.Image = vi.fn(function () {
    this.onload = null;
    this.src = '';
    setTimeout(() => this.onload && this.onload(), 0);
  });
});

describe('handleFiles', () => {
  it('should process files correctly', async () => {
    const files = [new File([''], 'test.png', { type: 'image/png' })];
    const setFiles = vi.fn();
    const setCoordinates = vi.fn();
    const coordinates = [];
    const padding = 10;

    vi.spyOn(global, 'FileReader');
    vi.spyOn(global, 'Image');

    handleFiles(files, setFiles, setCoordinates, coordinates, padding);

    await vi.runAllTimersAsync();

    expect(setFiles).toHaveBeenCalled();
    expect(FileReader).toHaveBeenCalled();
    expect(Image).toHaveBeenCalled();
  });
});
