import { render, screen, waitFor } from '@testing-library/react';
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
      'top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 font-bold text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300 opacity-0'
    );
  });

  it('disappears after a certain time', async () => {
    const testId = 1;
    const testMessage = 'This is a test message';
    const onClose = vi.fn();

    render(<Toast id={testId} message={testMessage} onClose={onClose} />);

    const toastElement = screen.getByText(testMessage);
    expect(toastElement).toBeInTheDocument();

    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalledWith(testId);
      },
      { timeout: 3000 }
    );
  });
});
