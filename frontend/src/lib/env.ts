/**
 * Shared environment flags for third-party integrations (analytics, error
 * reporting, etc.). Everything stays off outside production by default.
 */
export const isProduction =
  import.meta.env.VITE_IS_PRODUCTION?.trim().toLowerCase() === "true"
