import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../components/App';

test("renders 'Vite + React' header", () => {
  render(<App />);
  const headerElement = screen.getByText('App');
  expect(headerElement).toBeInTheDocument();
});
