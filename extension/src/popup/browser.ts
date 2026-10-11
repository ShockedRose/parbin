/**
 * Firefox exposes the promise-based `browser` namespace; Chromium browsers
 * (Chrome, Brave, Edge) expose `chrome`, which also returns promises in MV3.
 */
export const ext: typeof chrome = (globalThis as { browser?: typeof chrome }).browser ?? chrome
