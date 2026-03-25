/* PUBLIC_INTERFACE */
export function getAppName() {
  /**
   * Returns the UI app name. Optionally overridable via env var:
   * - REACT_APP_APP_NAME
   */
  return process.env.REACT_APP_APP_NAME || 'ClaimSentry';
}

/* PUBLIC_INTERFACE */
export function getAppTagline() {
  /** Optional tagline env var: REACT_APP_APP_TAGLINE */
  return process.env.REACT_APP_APP_TAGLINE || 'Claims risk analysis';
}
