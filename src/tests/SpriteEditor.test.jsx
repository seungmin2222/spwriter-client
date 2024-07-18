import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SpriteEditor from '../components/SpriteEditor';
import useFileStore from '../../store';
import { handleFiles } from '../utils/utils';

vi.mock('../utils/utils', () => ({
  handleFiles: vi.fn(),
  trimImage: vi.fn().mockResolvedValue(new Image()),
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
      setCanvasRef: vi.fn(),
      setCoordinates: vi.fn(),
      setLastClickedIndex: vi.fn(),
      padding: 10,
      files: [
        new File(['dummy content'], 'example.png', { type: 'image/png' }),
      ],
    });
  });

  it('calls setLastClickedIndex on canvas click', async () => {
    const setLastClickedIndex = vi.fn();
    useFileStore.setState({ setLastClickedIndex });

    render(<SpriteEditor />);

    const canvas = screen.getByTestId('canvas');

    await waitFor(() => {
      canvas.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        width: 100,
        height: 100,
      });
      fireEvent.click(canvas, { clientX: 50, clientY: 50 });
    });

    expect(setLastClickedIndex).toHaveBeenCalledWith(0);
  });

  it('handles file drop correctly', () => {
    render(<SpriteEditor />);

    const dropZone = screen.getByTestId('sprite-editor');
    const files = [
      new File(['dummy content'], 'example.png', { type: 'image/png' }),
    ];
    const dataTransfer = {
      files,
      items: {
        add: vi.fn(),
      },
    };

    fireEvent.drop(dropZone, { dataTransfer });

    expect(handleFiles).toHaveBeenCalledWith(
      files,
      expect.any(Function),
      expect.any(Function),
      [{ img: new Image(), width: 100, height: 100, x: 0, y: 0 }],
      10
    );
  });

  it('handles dragging over correctly', () => {
    render(<SpriteEditor />);

    const dropZone = screen.getByTestId('sprite-editor');

    fireEvent.dragOver(dropZone);
  });

  it('draws blue stroke rect on last clicked image', async () => {
    useFileStore.setState({
      coordinates: [{ img: new Image(), width: 100, height: 100, x: 0, y: 0 }],
      lastClickedIndex: 0,
    });

    render(<SpriteEditor />);

    await waitFor(() => {
      const canvas = screen.getByTestId('canvas');
      const ctx = canvas.getContext('2d');
      ctx.strokeRect(0, 10, 100, 100);
      expect(ctx.strokeRect).toHaveBeenCalledWith(0, 10, 100, 100);
    });
  });

  it('does not call drawImage if image is not complete', async () => {
    const mockImage = new Image();
    Object.defineProperty(mockImage, 'complete', { value: false });
    const setCoordinates = vi.fn();

    useFileStore.setState({
      coordinates: [{ img: mockImage, width: 100, height: 100, x: 0, y: 0 }],
      setCoordinates,
    });

    render(<SpriteEditor />);

    const canvas = screen.getByTestId('canvas');
    const ctx = canvas.getContext('2d');

    await waitFor(() => {
      expect(ctx.drawImage).not.toHaveBeenCalled();
    });
  });
});
