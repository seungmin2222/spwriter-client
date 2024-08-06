import { describe, it, expect, vi, beforeEach } from 'vitest';
import useFileStore from '../../store';
import { handleFiles, calculateCoordinates } from '../utils/utils';

vi.mock('../utils/utils', () => ({
  handleFiles: vi.fn(),
  trimImage: vi.fn().mockResolvedValue(new Image()),
  calculateCoordinates: vi.fn().mockReturnValue([]),
}));

describe('SpriteEditor component', () => {
  let getContextMock;

  beforeEach(() => {
    getContextMock = vi.fn(() => ({
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray([255, 255, 255, 255]),
      })),
      createPattern: vi.fn(() => ({})),
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      fillStyle: '',
      stroke: vi.fn(),
      strokeRect: vi.fn(),
    }));

    HTMLCanvasElement.prototype.getContext = getContextMock;

    useFileStore.setState({
      coordinates: [{ img: new Image(), width: 100, height: 100, x: 0, y: 0 }],
      setCoordinates: vi.fn(),
      setLastClickedIndex: vi.fn(),
      padding: 10,
      files: [
        new File(['dummy content'], 'example.png', { type: 'image/png' }),
      ],
      alignElement: 'left-right',
    });
  });

  it('should process files correctly', async () => {
    const mockFiles = [
      new File(['dummy content'], 'test.png', { type: 'image/png' }),
    ];
    const mockSetFiles = vi.fn();
    const mockSetCoordinates = vi.fn();
    const mockCoordinates = [];
    const mockPadding = 10;
    const mockAlignElement = 'left-right';

    calculateCoordinates.mockReturnValue([
      { img: new Image(), width: 100, height: 100, x: 0, y: 0 },
    ]);

    vi.mocked(handleFiles).mockImplementation(
      async (files, setFiles, setCoordinates) => {
        setFiles(prev => [...prev, ...files]);
        const newCoordinates = calculateCoordinates(
          files,
          mockPadding,
          mockAlignElement
        );
        setCoordinates(prev => [...prev, ...newCoordinates]);
      }
    );

    await handleFiles(
      mockFiles,
      mockSetFiles,
      mockSetCoordinates,
      mockCoordinates,
      mockPadding,
      mockAlignElement
    );

    expect(mockSetFiles).toHaveBeenCalled();
    expect(calculateCoordinates).toHaveBeenCalled();
    expect(mockSetCoordinates).toHaveBeenCalled();
  });
});
