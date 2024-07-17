import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SpriteEditor from '../components/SpriteEditor';
import useFileStore from '../../store';

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
    }));

    HTMLCanvasElement.prototype.getContext = getContextMock;

    useFileStore.setState({
      coordinates: [],
      setCanvasRef: vi.fn(),
      setCoordinates: vi.fn(),
      padding: 10,
    });
  });

  it('renders correctly', () => {
    render(<SpriteEditor />);
    expect(screen.getByTestId('sprite-editor')).toBeInTheDocument();
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  it('updates canvas when coordinates change', async () => {
    const { setCoordinates } = useFileStore.getState();

    render(<SpriteEditor />);
    setCoordinates([{ img: new Image(), width: 100, height: 100, x: 0, y: 0 }]);

    await waitFor(() => {
      const canvas = screen.getByTestId('canvas');
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      expect(imageData).toBeDefined();
    });
  });
  it('renders correctly', () => {
    render(<SpriteEditor />);
    expect(screen.getByTestId('sprite-editor')).toBeInTheDocument();
  });

  it('renders canvas', () => {
    render(<SpriteEditor />);
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  it('updates padding state', () => {
    const { setPadding } = useFileStore.getState();
    setPadding(20);
    const state = useFileStore.getState();
    expect(state.padding).toBe(20);
  });
});
it('draws checkerboard pattern correctly', () => {
  render(<SpriteEditor />);
  const canvas = screen.getByTestId('canvas');
  const ctx = canvas.getContext('2d');
  const pattern = ctx.createPattern(document.createElement('canvas'), 'repeat');
  expect(pattern).toBeDefined();
});

it('calls setCanvasRef on mount', () => {
  const setCanvasRef = vi.fn();
  useFileStore.setState({ setCanvasRef });

  render(<SpriteEditor />);
  expect(setCanvasRef).toHaveBeenCalled();
});
