import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders sidebar navigation when authenticated', () => {
  // Enable auth for this test so the app uses the gating path.
  process.env.REACT_APP_AUTH_USERNAME = 'testuser';
  process.env.REACT_APP_AUTH_PASSWORD = 'testpass';

  // Simulate an authenticated local session.
  window.localStorage.setItem('fraudui.auth.v1', JSON.stringify({ ok: true, ts: Date.now() }));

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
