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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getJWTToken(request);
  const payload = token ? decodeJWTPayload(token) : null;
  const isAuthenticated = token !== null && !isTokenExpired(payload);
  const userRole = getUserRole(request);

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
