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
    login: `${BACKEND_URL}/api/auth/token/`,
    logout: `${BACKEND_URL}/api/auth/logout/`,
    signup: `${BACKEND_URL}/api/auth/signup/`,
    verifyEmail: `${BACKEND_URL}/api/auth/verify-email/`,
    resendVerification: `${BACKEND_URL}/api/auth/resend-verification/`,
    changePassword: `${BACKEND_URL}/api/auth/change-password/`,
    csrf: `${BACKEND_URL}/api/auth/csrf/`,
    token: `${BACKEND_URL}/api/auth/token/`,
    tokenRefresh: `${BACKEND_URL}/api/auth/token/refresh/`,
    addFeedback: `${BACKEND_URL}/api/auth/add-feedback/`,
  },
  // User management
  users: {
    me: `${BACKEND_URL}/api/auth/users/me/`,
    list: `${BACKEND_URL}/api/auth/users/`,
    detail: (pk: string) => `${BACKEND_URL}/api/auth/users/${pk}/`,
    profile: `${BACKEND_URL}/api/users/profile/`,
  },
  // Resume parsing
  resume: {},
  // Candidate profiles
  candidateProfiles: {
    list: `${BACKEND_URL}/api/candidates/profiles/`,
    detail: (slug: string) => `${BACKEND_URL}/api/candidates/profiles/${slug}/`,
    full: (slug: string) =>
      `${BACKEND_URL}/api/candidates/profiles/${slug}/full/`,
    parseResume: (slug: string) =>
      `${BACKEND_URL}/api/candidates/profiles/${slug}/parse-resume/`,
    parsingStatus: (slug: string, includeResume?: boolean) => {
      const url = `${BACKEND_URL}/api/candidates/profiles/${slug}/parsing-status/`;
      return includeResume ? `${url}?include_resume=true` : url;
    },
    verifyProfile: (slug: string) =>
      `${BACKEND_URL}/api/candidates/profiles/${slug}/verify-profile/`,
    careerCoach: `${BACKEND_URL}/api/candidates/career-coach/`,
    resumePrompt: `${BACKEND_URL}/api/candidates/prompt/`,
  },
    candidateData: {
      education: `${BACKEND_URL}/api/candidates/education/`,
      educationDetail: (id: string) => `${BACKEND_URL}/api/candidates/education/${id}/`,
      skills: `${BACKEND_URL}/api/candidates/skills/`,
    skillsDetail: (id: string) => `${BACKEND_URL}/api/candidates/skills/${id}/`,
    languages: `${BACKEND_URL}/api/candidates/languages/`,
    notes: `${BACKEND_URL}/api/candidates/notes/`,
    workExperience: `${BACKEND_URL}/api/candidates/work-experience/`,
    workExperienceDetail: (id: string) =>
      `${BACKEND_URL}/api/candidates/work-experience/${id}/`,
    projects: `${BACKEND_URL}/api/candidates/projects/`,
    projectsDetail: (id: string) =>
      `${BACKEND_URL}/api/candidates/projects/${id}/`,
    achievements: `${BACKEND_URL}/api/candidates/achievements/`,
    achievementsDetail: (id: string) =>
      `${BACKEND_URL}/api/candidates/achievements/${id}/`,
    certifications: `${BACKEND_URL}/api/candidates/certifications/`,
    certificationsDetail: (id: string) =>
      `${BACKEND_URL}/api/candidates/certifications/${id}/`,
  },
  // Other APIs
  organizations: {
    list: `${BACKEND_URL}/api/organization/organizations/`,
    detail: (pk: string) =>
      `${BACKEND_URL}/api/organization/organizations/${pk}/`,
    createInvite: (pk: string) =>
      `${BACKEND_URL}/api/organization/organizations/${pk}/create-invite/`,
    selectedCandidates: `${BACKEND_URL}/api/organization/selected-candidates/`,
    candidateInsight: (candidateId: string | number) =>
      `${BACKEND_URL}/api/organization/test/candidate-insight/${candidateId}/`,
  },
  jobs: {
    list: `${BACKEND_URL}/api/channels/jobs/`,
    detail: (pk: string) => `${BACKEND_URL}/api/channels/jobs/${pk}/`,
    rankCandidates: (id: string) =>
      `${BACKEND_URL}/api/channels/jobs/${id}/rank-candidates/`,
    rankingData: (id: string) =>
      `${BACKEND_URL}/api/channels/jobs/${id}/ranking-data/`,
    applicationDecision: (jobId: string, applicationId: string) =>
      `${BACKEND_URL}/api/jobs/${jobId}/applications/${applicationId}/decision`,
  },
  agent: {
    search: `${BACKEND_URL}/api/channels/agent/`,
  },
  channels: `${BACKEND_URL}/api/channels/`,
  candidates: `${BACKEND_URL}/api/candidates/`,
  candidateTests: {
    generateAbout: `${BACKEND_URL}/api/candidates/test/generate-about/`,
  },
} as const;

/**
 * Default fetch options for API calls
 * - credentials: 'include' ensures cookies are sent cross-origin (required for HttpOnly JWT)
 */
export const defaultFetchOptions: RequestInit = {
  credentials: "include",
};

const CSRF_COOKIE_NAME = "csrftoken";
const ACCESS_TOKEN_COOKIE_NAME = "access_token";

const getCookieValue = (cookieHeader: string, name: string): string | null => {
  if (!cookieHeader) return null;
  const entries = cookieHeader.split(";").map((entry) => entry.trim());
  for (const entry of entries) {
    if (!entry) continue;
    const [key, ...rest] = entry.split("=");
    if (key === name) {
      return rest.join("=") ? decodeURIComponent(rest.join("=")) : "";
    }
  }
  return null;
};

const isWriteMethod = (method?: string) =>
  ["POST", "PUT", "PATCH", "DELETE"].includes((method || "GET").toUpperCase());

/**
 * Helper function to make API requests to the Django backend
 * Handles CSRF token injection and cookie forwarding
 */
export async function backendFetch(
  endpoint: string,
  options: RequestInit = {},
  incomingCookies?: string,
): Promise<Response> {
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  // Set content type if not already set
  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Forward cookies from incoming request to backend
  if (incomingCookies) {
    headers.set("Cookie", incomingCookies);
  }

  // Add Authorization header from HttpOnly JWT cookie when available
  if (!headers.has("Authorization") && incomingCookies) {
    const accessToken = getCookieValue(
      incomingCookies,
      ACCESS_TOKEN_COOKIE_NAME,
    );
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  // Add CSRF token for write requests if available
  if (isWriteMethod(options.method) && !headers.has("X-CSRFToken")) {
    const csrfToken = incomingCookies
      ? getCookieValue(incomingCookies, CSRF_COOKIE_NAME)
      : null;
    if (csrfToken) {
      headers.set("X-CSRFToken", csrfToken);
    }
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

  const headers = backendResponse.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const allCookies = headers.getSetCookie?.();
  if (allCookies && allCookies.length > 0) {
    setCookieHeaders.push(...allCookies);
    return setCookieHeaders;
  }

  const setCookieHeader = backendResponse.headers.get("set-cookie");
  if (setCookieHeader) {
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
  nextResponse: Response,
): void {
  const setCookieHeaders = extractSetCookieHeaders(backendResponse);

  setCookieHeaders.forEach((cookie) => {
    nextResponse.headers.append("Set-Cookie", cookie);
  });
}
