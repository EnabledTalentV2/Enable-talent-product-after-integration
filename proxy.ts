import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/employer"];

// Routes accessible only to job seekers
const JOB_SEEKER_ROUTES = ["/dashboard"];

// Routes accessible only to employers
const EMPLOYER_ROUTES = ["/employer"];

// Create route matchers for Clerk
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/employer(.*)",
]);

const isAuthRoute = createRouteMatcher([
  "/login-talent",
  "/login-employer",
  "/signup",
  "/signup-employer",
  "/signup/(.*)",
]);

type UserRole = "employer" | "job_seeker";
type BackendRoleLookup = { role: UserRole | null; status: number | null };

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
): Promise<BackendRoleLookup> {
  try {
    const response = await fetch(new URL("/api/user/me", request.url), {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { role: null, status: response.status };
    }
    const data = await response.json().catch(() => null);
    return { role: deriveUserRoleFromUserData(data), status: response.status };
  } catch (error) {
    console.error("[Proxy] Failed to resolve role from API:", error);
    return { role: null, status: null };
  }
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const { userId } = await auth();
  const isAuthenticated = !!userId;

  // Fetch user role from Django API for role-based routing
  let userRole: UserRole | null = null;
  let backendRoleStatus: number | null = null;
  const needsRoleLookup =
    isAuthenticated &&
    (pathname.startsWith("/employer") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/login-") ||
      pathname === "/signup" ||
      pathname === "/signup-employer");

  if (needsRoleLookup) {
    const lookup = await fetchUserRoleFromApi(request);
    userRole = lookup.role;
    backendRoleStatus = lookup.status;
  }

  // Debug logging - remove in production
  console.log("[Proxy]", {
    pathname,
    isAuthenticated,
    userRole,
    backendRoleStatus,
  });

  // Check if route types
  const isJobSeekerRoute = JOB_SEEKER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isEmployerRoute = EMPLOYER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // If trying to access protected route without authentication
  if (isProtectedRoute(request) && !isAuthenticated) {
    // Redirect to appropriate login page
    if (isEmployerRoute) {
      return NextResponse.redirect(new URL("/login-employer", request.url));
    }
    return NextResponse.redirect(new URL("/login-talent", request.url));
  }

  // If authenticated in Clerk but missing in backend, block protected routes
  // to avoid redirect loops and let the user complete backend sync.
  if (isProtectedRoute(request) && isAuthenticated && backendRoleStatus === 401) {
    const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    const next = encodeURIComponent(requestedPath);
    const reason = "backend_user_missing";
    const redirectPath = isEmployerRoute
      ? `/login-employer?next=${next}&reason=${reason}`
      : `/login-talent?next=${next}&reason=${reason}`;
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Role-based access control - ALWAYS enforce if authenticated
  if (isAuthenticated && userRole) {
    // Prevent job seekers from accessing employer routes
    if (isEmployerRoute && userRole !== "employer") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Prevent employers from accessing job seeker routes
    if (isJobSeekerRoute && userRole === "employer") {
      return NextResponse.redirect(new URL("/employer/dashboard", request.url));
    }
  }

  // If authenticated user tries to access login pages, redirect to dashboard
  if (isAuthenticated && userRole && isAuthRoute(request)) {
    if (userRole === "employer") {
      return NextResponse.redirect(new URL("/employer/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
