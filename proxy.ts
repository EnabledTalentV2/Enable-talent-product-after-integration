import { NextResponse, NextRequest } from "next/server";
import { decodeJwt } from "jose";

// Cookie names used by Django backend for authentication (in priority order)
const AUTH_COOKIE_NAMES = ["access_token", "jwt", "token", "sessionid"];

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/employer"];

// Routes accessible only to job seekers
const JOB_SEEKER_ROUTES = ["/dashboard"];

// Routes accessible only to employers
const EMPLOYER_ROUTES = ["/employer"];

interface JWTPayload {
  user_id?: string;
  email?: string;
  role?: string;
  user_type?: string; // Django might use this instead of 'role'
  is_employer?: boolean;
  exp?: number;
}

/**
 * Get the JWT token from cookies
 */
function getJWTToken(request: NextRequest): string | null {
  for (const cookieName of AUTH_COOKIE_NAMES) {
    const cookie = request.cookies.get(cookieName);
    if (cookie?.value) {
      return cookie.value;
    }
  }
  return null;
}

/**
 * Decode JWT and extract user info (without verification for routing)
 * Note: Actual JWT verification happens on Django backend for API calls
 * This is just for routing purposes - we decode to get the role
 */
function decodeJWTPayload(token: string): JWTPayload | null {
  try {
    // Decode without verification (for routing only)
    // The backend will verify the token when API calls are made
    const payload = decodeJwt(token) as JWTPayload;
    return payload;
  } catch (error) {
    console.error("[Proxy] Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Get user role from JWT payload
 */
function getUserRoleFromToken(payload: JWTPayload | null): string | null {
  if (!payload) return null;

  // Check various possible field names Django might use
  if (payload.role) return payload.role;
  if (payload.user_type) return payload.user_type;
  if (payload.is_employer === true) return "employer";
  if (payload.is_employer === false) return "job_seeker";

  return null;
}

/**
 * Check if token is expired
 */
function isTokenExpired(payload: JWTPayload | null): boolean {
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

/**
 * Get user role - first try JWT, then fallback to cookie
 */
function getUserRole(request: NextRequest): string | null {
  // First, try to get role from JWT token
  const token = getJWTToken(request);
  if (token) {
    const payload = decodeJWTPayload(token);
    const roleFromToken = getUserRoleFromToken(payload);
    if (roleFromToken) return roleFromToken;
  }

  // Fallback to role cookie (if backend sets one)
  const roleCookie = request.cookies.get("user_role");
  if (roleCookie?.value) {
    return roleCookie.value;
  }

  return null;
}

type UserRole = "employer" | "job_seeker";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hasNonEmptyArray = (value: unknown): value is unknown[] =>
  Array.isArray(value) && value.length > 0;

const USER_DATA_KEYS = ["data", "user", "profile", "me", "result"] as const;
const USER_COLLECTION_KEYS = ["results", "items", "users"] as const;

const looksLikeUserData = (record: Record<string, unknown>) =>
  typeof record.email === "string" ||
  "is_candidate" in record ||
  "is_employer" in record ||
  "organization" in record ||
  "organization_id" in record ||
  "organizationId" in record ||
  "organizations" in record ||
  "role" in record ||
  "user_type" in record ||
  "userType" in record;

const unwrapUserData = (data: unknown): Record<string, unknown> | null => {
  if (!isRecord(data)) return null;
  if (looksLikeUserData(data)) return data;

  for (const key of USER_DATA_KEYS) {
    const nested = data[key];
    if (isRecord(nested) && looksLikeUserData(nested)) return nested;
  }

  for (const key of USER_COLLECTION_KEYS) {
    const nested = data[key];
    if (Array.isArray(nested)) {
      const entry = nested.find(isRecord);
      if (entry && looksLikeUserData(entry)) return entry;
    }
  }

  return data;
};

function deriveUserRoleFromUserData(data: unknown): UserRole | null {
  const record = unwrapUserData(data);
  if (!record) return null;

  const roleValue =
    (typeof record.role === "string" && record.role) ||
    (typeof record.user_type === "string" && record.user_type) ||
    (typeof record.userType === "string" && record.userType) ||
    null;

  if (roleValue) {
    const normalized = roleValue.toLowerCase();
    if (normalized.includes("employer")) return "employer";
    if (
      normalized.includes("candidate") ||
      normalized.includes("talent") ||
      normalized.includes("job")
    ) {
      return "job_seeker";
    }
  }

  const isEmployer =
    record.is_employer === true ||
    record.isEmployer === true ||
    Boolean(record.organization) ||
    Boolean(record.organization_id) ||
    Boolean(record.organizationId) ||
    hasNonEmptyArray(record.organizations);

  if (isEmployer) return "employer";

  const candidateFlag =
    record.is_candidate === true || record.isCandidate === true
      ? true
      : record.is_candidate === false || record.isCandidate === false
      ? false
      : null;

  const isCandidate =
    candidateFlag === true ||
    Boolean(record.candidate_profile) ||
    Boolean(record.candidateProfile);

  if (candidateFlag === false) return "employer";

  if (isCandidate) return "job_seeker";

  return null;
}

async function fetchUserRoleFromApi(
  request: NextRequest
): Promise<UserRole | null> {
  try {
    const response = await fetch(new URL("/api/user/me", request.url), {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const data = await response.json().catch(() => null);
    return deriveUserRoleFromUserData(data);
  } catch (error) {
    console.error("[Proxy] Failed to resolve role from API:", error);
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getJWTToken(request);
  const payload = token ? decodeJWTPayload(token) : null;
  const isAuthenticated = token !== null && !isTokenExpired(payload);
  let userRole = getUserRole(request);

  const needsRoleLookup =
    isAuthenticated &&
    userRole === null &&
    (pathname.startsWith("/employer") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/login-") ||
      pathname === "/signup" ||
      pathname === "/signup-employer");

  if (needsRoleLookup) {
    userRole = await fetchUserRoleFromApi(request);
  }

  // Debug logging - remove in production
  console.log("[Proxy]", {
    pathname,
    isAuthenticated,
    userRole,
    cookies: request.cookies.getAll().map((c) => c.name),
  });

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isJobSeekerRoute = JOB_SEEKER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isEmployerRoute = EMPLOYER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // If trying to access protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to appropriate login page
    if (isEmployerRoute) {
      return NextResponse.redirect(new URL("/login-employer", request.url));
    }
    return NextResponse.redirect(new URL("/login-talent", request.url));
  }

  // Role-based access control - ALWAYS enforce if authenticated
  if (isAuthenticated) {
    // Prevent job seekers from accessing employer routes
    if (isEmployerRoute && userRole !== "employer") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Prevent employers from accessing job seeker routes
    if (isJobSeekerRoute && userRole === "employer") {
      return NextResponse.redirect(new URL("/employer", request.url));
    }
  }

  // If authenticated user tries to access login pages, redirect to dashboard
  if (
    isAuthenticated &&
    (pathname.startsWith("/login-") ||
      pathname === "/signup" ||
      pathname === "/signup-employer")
  ) {
    if (userRole === "employer") {
      return NextResponse.redirect(new URL("/employer", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/employer/:path*",
    // Auth routes (to redirect if already logged in)
    "/login-talent",
    "/login-employer",
    "/signup",
    "/signup-employer",
    "/signup/:path*",
  ],
};
