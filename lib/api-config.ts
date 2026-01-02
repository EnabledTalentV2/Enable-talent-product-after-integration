/**
 * Backend API Configuration
 * Centralizes all backend API endpoints and utilities for connecting to Django backend
 */

// Django backend base URL
export const BACKEND_URL =
  process.env.BACKEND_URL || "https://etbackend-v2-usy9.onrender.com";

/**
 * API Endpoints - mapped to Django URL patterns
 */
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: `${BACKEND_URL}/api/auth/session/login/`,
    logout: `${BACKEND_URL}/api/auth/session/logout/`,
    signup: `${BACKEND_URL}/api/auth/signup/`,
    signupInit: `${BACKEND_URL}/api/auth/signup-init/`, // Returns temporary token for resume parsing
    verifyEmail: `${BACKEND_URL}/api/auth/verify-email/`,
    resendVerification: `${BACKEND_URL}/api/auth/resend-verification/`,
    changePassword: `${BACKEND_URL}/api/auth/change-password/`,
    csrf: `${BACKEND_URL}/api/auth/csrf/`,
    token: `${BACKEND_URL}/api/auth/token/`,
    tokenRefresh: `${BACKEND_URL}/api/auth/token/refresh/`,
  },
  // User management
  users: {
    me: `${BACKEND_URL}/api/auth/users/me/`,
    list: `${BACKEND_URL}/api/auth/users/`,
    detail: (pk: string) => `${BACKEND_URL}/api/auth/users/${pk}/`,
  },
  // Resume parsing (requires temporary signup token)
  resume: {
    parse: `${BACKEND_URL}/api/candidates/parse-resume/`,
  },
  // Candidate profiles
  candidateProfiles: {
    list: `${BACKEND_URL}/api/candidates/profiles/`,
    detail: (slug: string) => `${BACKEND_URL}/api/candidates/profiles/${slug}/`,
    parseResume: (slug: string) =>
      `${BACKEND_URL}/api/candidates/profiles/${slug}/parse-resume/`,
    parsingStatus: (slug: string) =>
      `${BACKEND_URL}/api/candidates/profiles/${slug}/parsing-status/`,
  },
  // Other APIs
  organizations: {
    list: `${BACKEND_URL}/api/organization/organizations/`,
    detail: (pk: string) =>
      `${BACKEND_URL}/api/organization/organizations/${pk}/`,
    createInvite: (pk: string) =>
      `${BACKEND_URL}/api/organization/organizations/${pk}/create-invite/`,
  },
  channels: `${BACKEND_URL}/api/channels/`,
  candidates: `${BACKEND_URL}/api/candidates/`,
} as const;

/**
 * Default fetch options for API calls
 * - credentials: 'include' ensures cookies are sent cross-origin (required for HttpOnly JWT)
 */
export const defaultFetchOptions: RequestInit = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
};

/**
 * Helper function to make API requests to the Django backend
 * Handles CSRF token injection and cookie forwarding
 */
export async function backendFetch(
  endpoint: string,
  options: RequestInit = {},
  incomingCookies?: string
): Promise<Response> {
  const headers = new Headers(options.headers);

  // Set content type if not already set
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  // Forward cookies from incoming request to backend
  if (incomingCookies) {
    headers.set("Cookie", incomingCookies);
  }

  const response = await fetch(endpoint, {
    ...defaultFetchOptions,
    ...options,
    headers,
  });

  return response;
}

/**
 * Extract Set-Cookie headers from backend response and format for Next.js response
 */
export function extractSetCookieHeaders(backendResponse: Response): string[] {
  const setCookieHeaders: string[] = [];

  // Get all Set-Cookie headers from the backend response
  const setCookieHeader = backendResponse.headers.get("set-cookie");
  if (setCookieHeader) {
    // Handle multiple cookies (they may be comma-separated or multiple headers)
    setCookieHeaders.push(setCookieHeader);
  }

  return setCookieHeaders;
}

/**
 * Forward cookies from backend response to the client
 * Used in API route handlers to pass HttpOnly cookies through
 */
export function forwardCookiesToResponse(
  backendResponse: Response,
  nextResponse: Response
): void {
  const setCookieHeaders = extractSetCookieHeaders(backendResponse);

  setCookieHeaders.forEach((cookie) => {
    nextResponse.headers.append("Set-Cookie", cookie);
  });
}
