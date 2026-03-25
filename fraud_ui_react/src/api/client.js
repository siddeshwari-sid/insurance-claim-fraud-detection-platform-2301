/* PUBLIC_INTERFACE */
export function getBackendBaseUrl() {
  /**
   * Env var needed for local dev if frontend and backend are on different origins:
   * REACT_APP_BACKEND_URL (e.g., http://localhost:3001)
   */
  return process.env.REACT_APP_BACKEND_URL || '';
}

async function request(path, options = {}) {
  const url = `${getBackendBaseUrl()}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { status: 'error', message: 'Non-JSON response from server' };
  }

  if (!res.ok) {
    const msg = data && data.message ? data.message : `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/* PUBLIC_INTERFACE */
export function uploadClaims({ csvText, filename }) {
  return request('/api/claims/upload', {
    method: 'POST',
    body: JSON.stringify({ csvText, filename }),
  });
}

/* PUBLIC_INTERFACE */
export function fetchClaims(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    qs.set(k, String(v));
  });
  const suffix = qs.toString() ? `?${qs}` : '';
  return request(`/api/claims${suffix}`, { method: 'GET' });
}

/* PUBLIC_INTERFACE */
export function fetchClaimById(id) {
  return request(`/api/claims/${encodeURIComponent(id)}`, { method: 'GET' });
}

/* PUBLIC_INTERFACE */
export function fetchSummaryReport() {
  return request('/api/reports/summary', { method: 'GET' });
}

/* PUBLIC_INTERFACE */
export function fetchQueue() {
  return request('/api/queue', { method: 'GET' });
}
