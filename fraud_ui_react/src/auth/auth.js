const AUTH_STORAGE_KEY = 'fraudui.auth.v1';

/**
 * Minimal client-side auth gate.
 * This is NOT secure and is intended only as a UI gate (per request).
 * Credentials are compared against environment variables.
 */

function safeTrim(v) {
  return String(v || '').trim();
}

/* PUBLIC_INTERFACE */
export function getAuthConfig() {
  /**
   * Returns the auth configuration from environment variables.
   * Env vars to set in .env:
   * - REACT_APP_AUTH_USERNAME
   * - REACT_APP_AUTH_PASSWORD
   */
  return {
    username: safeTrim(process.env.REACT_APP_AUTH_USERNAME),
    password: safeTrim(process.env.REACT_APP_AUTH_PASSWORD),
  };
}

/* PUBLIC_INTERFACE */
export function isAuthEnabled() {
  /** Auth is enabled only when both username and password env vars are present. */
  const { username, password } = getAuthConfig();
  return Boolean(username && password);
}

/* PUBLIC_INTERFACE */
export function isAuthed() {
  /** Returns true if the user has an active local session, or auth is disabled. */
  if (!isAuthEnabled()) return true;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed && parsed.ok && parsed.ts);
  } catch {
    return false;
  }
}

/* PUBLIC_INTERFACE */
export function signIn({ username, password }) {
  /**
   * Attempts to sign in.
   * @returns {{ ok: boolean, error?: string }}
   */
  const cfg = getAuthConfig();
  if (!isAuthEnabled()) return { ok: true };

  const u = safeTrim(username);
  const p = safeTrim(password);

  if (!u || !p) return { ok: false, error: 'Enter username and password.' };

  if (u !== cfg.username || p !== cfg.password) {
    return { ok: false, error: 'Invalid credentials.' };
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ok: true, ts: Date.now() }));
  return { ok: true };
}

/* PUBLIC_INTERFACE */
export function signOut() {
  /** Clears the local session. */
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }
}
