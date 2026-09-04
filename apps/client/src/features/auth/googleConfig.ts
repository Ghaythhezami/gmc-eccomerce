/**
 * Google sign-in is optional: the app must run without credentials.
 *
 * When VITE_GOOGLE_CLIENT_ID is empty, GoogleOAuthProvider still needs *some* client id,
 * but sending the user to Google with a fake one only produces "Error 401: invalid_client".
 * So we surface `isGoogleConfigured` and disable the button instead.
 */
export const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim();

export const isGoogleConfigured = googleClientId.length > 0;

/** Non-empty value for GoogleOAuthProvider; never actually used for a real request. */
export const googleProviderClientId = googleClientId || 'not-configured.apps.googleusercontent.com';

export const googleNotConfiguredMessage =
  'Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID in apps/client/.env and restart the dev server.';
