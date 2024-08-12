import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Toast from '../components/Toast';

describe('Toast component', () => {
  it('renders the Toast component with the correct message', () => {
    const testId = 1;
    const testMessage = 'This is a test message';

    render(<Toast id={testId} message={testMessage} onClose={() => {}} />);

    const toastElement = screen.getByText(testMessage);
    expect(toastElement).toBeInTheDocument();
    expect(toastElement).toHaveClass(
      'fixed bottom-16 left-[63%] transform -translate-x-1/2 bg-[#241f3a] font-bold text-white px-4 py-2 z-50 rounded-[1rem] shadow-lg transition-opacity duration-300 opacity-0'
    );
  });

  it('disappears after a certain time', async () => {
    vi.useFakeTimers();

    const testId = 1;
    const testMessage = 'This is a test message';
    const onClose = vi.fn();

    render(<Toast id={testId} message={testMessage} onClose={onClose} />);

    const toastElement = screen.getByText(testMessage);
    expect(toastElement).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(10);
    });
    expect(toastElement).toHaveClass('opacity-100');

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(toastElement).toHaveClass('opacity-0');

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(onClose).toHaveBeenCalledWith(testId);

    vi.useRealTimers();
  });
});
