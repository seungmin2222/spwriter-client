import { expect, it, describe } from 'vitest';
import analyzeSpritesSheet from '../utils/spriteAnalyzer';

describe('analyzeSpritesSheet', () => {
  it('단일 스프라이트를 올바르게 식별해야 합니다', () => {
    const imageData: number[] = [
      255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
    ];
    const width = 2;
    const height = 2;

    const result = analyzeSpritesSheet(imageData, width, height);

    expect(result).toEqual([{ x: 0, y: 0, width: 2, height: 2 }]);
  });

  it('인접한 스프라이트를 병합해야 합니다', () => {
    const imageData: number[] = [
      255, 0, 0, 255, 0, 0, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0,
      255, 255, 0, 0, 255, 0, 0, 0, 0, 255, 0, 0, 255, 0, 0, 0, 0,
    ];
    const width = 3;
    const height = 3;

    const result = analyzeSpritesSheet(imageData, width, height);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: 0, y: 0, width: 3, height: 3 });
  });

  it('여러 개의 분리된 스프라이트를 식별해야 합니다', () => {
    const imageData: number[] = [
      255, 0, 0, 255, 0, 0, 0, 0, 255, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 255, 0, 0, 255, 0, 0, 0, 0,
    ];
    const width = 3;
    const height = 3;

    const result = analyzeSpritesSheet(imageData, width, height);

    expect(result).toHaveLength(3);
    expect(result).toContainEqual({ x: 0, y: 0, width: 1, height: 1 });
    expect(result).toContainEqual({ x: 2, y: 0, width: 1, height: 1 });
    expect(result).toContainEqual({ x: 1, y: 2, width: 1, height: 1 });
  });

  it('여러 스프라이트를 하나로 병합하여 올바르게 처리해야 합니다', () => {
    const imageData: number[] = [
      255, 0, 0, 255, 0, 0, 0, 0, 255, 0, 0, 255, 0, 0, 0, 0, 255, 0, 0, 255, 0,
      0, 0, 0, 255, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 255, 255, 0,
      0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0,
      255,
    ];
    const width = 4;
    const height = 4;

    const result = analyzeSpritesSheet(imageData, width, height);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: 0, y: 0, width: 4, height: 4 });
  });
});
