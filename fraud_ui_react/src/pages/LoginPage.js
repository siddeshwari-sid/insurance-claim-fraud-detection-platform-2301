import React, { useMemo, useState } from 'react';
import '../components/ui.css';
import { signIn } from '../auth/auth';

// PUBLIC_INTERFACE
export default function LoginPage({ appName = 'App', onSuccess }) {
  /** Login screen for the simple UI gate. */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(
    () => Boolean(String(username).trim() && String(password).trim()),
    [username, password]
  );

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = signIn({ username, password });
      if (!res.ok) {
        setError(res.error || 'Login failed.');
        return;
      }
      if (typeof onSuccess === 'function') onSuccess();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 18 }}>
      <div className="card" style={{ width: 'min(520px, 100%)' }}>
        <div className="cardBody">
          <div style={{ fontWeight: 950, fontSize: 22, marginBottom: 6 }}>{appName}</div>
          <div style={{ color: 'var(--textMuted)', fontSize: 13, marginBottom: 16 }}>
            Sign in to continue.
          </div>

          {error ? (
            <div className="error" style={{ marginBottom: 12 }}>
              <strong>Error:</strong> {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit}>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label className="label" htmlFor="login-username">
                  Username
                </label>
                <input
                  id="login-username"
                  className="input"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="label" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  className="input"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>

              <div className="btnRow" style={{ justifyContent: 'flex-end' }}>
                <button className="button buttonPrimary" type="submit" disabled={!canSubmit || busy}>
                  {busy ? 'Signing in…' : 'Sign in'}
                </button>
              </div>
            </div>
          </form>

          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--textMuted)' }}>
            This is a simple UI gate (not a secure authentication system).
          </div>
        </div>
      </div>
    </div>
  );
}
