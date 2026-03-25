import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders sidebar navigation', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  expect(screen.getByText(/ClaimSentry/i)).toBeInTheDocument();
  expect(screen.getByText(/Upload/i)).toBeInTheDocument();
  expect(screen.getByText(/Claims/i)).toBeInTheDocument();
  expect(screen.getByText(/Reports/i)).toBeInTheDocument();
});
