/**
 * Backend API Configuration
 * Centralizes all backend API endpoints and utilities for connecting to Django backend
 */

import { auth } from "@clerk/nextjs/server";

// Django backend base URL
export const BACKEND_URL =
  process.env.BACKEND_URL || "https://etbackend-v2-usy9.onrender.com";

/**
 * API Endpoints - mapped to Django URL patterns
 */
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    clerkSync: `${BACKEND_URL}/api/auth/clerk-sync/`,
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
  candidateInvites: {
    list: `${BACKEND_URL}/api/candidates/job-invites/`,
    respond: `${BACKEND_URL}/api/candidates/job-invites/respond/`,
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
    jobInvite: (jobId: string | number) =>
      `${BACKEND_URL}/api/organization/jobs/${jobId}/invite/`,
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
 */
export const defaultFetchOptions: RequestInit = {
  credentials: "include",
};

/**
 * Helper function to make API requests to the Django backend
 * Verifies Clerk session and sends X-Clerk-User-Id header to Django
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

  // Verify Clerk session and send auth headers to Django
  try {
    const { userId, getToken } = await auth();
    if (userId) {
      headers.set("X-Clerk-User-Id", userId);

      // Send session JWT for Django to independently verify
      const token = await getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
  } catch {
    // auth() may fail in non-request contexts; continue without user ID
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
