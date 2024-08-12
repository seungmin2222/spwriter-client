import { expect, it, describe } from 'vitest';
import analyzeSpritesSheet from '../utils/spriteAnalyzer';

describe('analyzeSpritesSheet', () => {
  it('should correctly identify a single sprite', () => {
    const imageData = new Uint8ClampedArray([
      255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
    ]);
    const width = 2;
    const height = 2;

    const result = analyzeSpritesSheet(imageData, width, height);

    expect(result).toEqual([{ x: 0, y: 0, width: 2, height: 2 }]);
  });

  it('should merge adjacent sprites', () => {
    const imageData = new Uint8ClampedArray([
      255, 0, 0, 255, 0, 0, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0,
      255, 255, 0, 0, 255, 0, 0, 0, 0, 255, 0, 0, 255, 0, 0, 0, 0,
    ]);
    const width = 3;
    const height = 3;

    const result = analyzeSpritesSheet(imageData, width, height);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: 0, y: 0, width: 3, height: 3 });
  });

  it('should identify multiple separate sprites', () => {
    const imageData = new Uint8ClampedArray([
      255, 0, 0, 255, 0, 0, 0, 0, 255, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 255, 0, 0, 255, 0, 0, 0, 0,
    ]);
    const width = 3;
    const height = 3;

    const result = analyzeSpritesSheet(imageData, width, height);

    expect(result).toHaveLength(3);
    expect(result).toContainEqual({ x: 0, y: 0, width: 1, height: 1 });
    expect(result).toContainEqual({ x: 2, y: 0, width: 1, height: 1 });
    expect(result).toContainEqual({ x: 1, y: 2, width: 1, height: 1 });
  });

  it('should correctly handle multiple sprites by merging them into one', () => {
    const imageData = new Uint8ClampedArray([
      255, 0, 0, 255, 0, 0, 0, 0, 255, 0, 0, 255, 0, 0, 0, 0, 255, 0, 0, 255, 0,
      0, 0, 0, 255, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 255, 255, 0,
      0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0,
      255,
    ]);
    const width = 4;
    const height = 4;

    const result = analyzeSpritesSheet(imageData, width, height);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: 0, y: 0, width: 4, height: 4 });
  });
});
