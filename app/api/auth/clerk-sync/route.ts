import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  BACKEND_URL,
  backendFetchWithToken,
  forwardCookiesToResponse,
} from "@/lib/api-config";

/**
 * POST /api/auth/clerk-sync/
 *
 * Syncs Clerk user to Django backend
 * Called after Clerk signup/login to ensure user exists in Django
 *
 * Request body:
 * {
 *   clerk_user_id: string,  // Clerk user ID (e.g., "user_2abc123...")
 *   email: string,          // User's email address
 *   token: string           // Fresh Clerk JWT from client (getToken({ template:'api', skipCache:true }))
 * }
 *
 * Response:
 * {
 *   id: number,              // Django user ID
 *   clerk_user_id: string,
 *   email: string,
 *
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify the caller has a valid Clerk session
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized – no active Clerk session" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const cookies = request.headers.get("cookie") || "";

    // 2. Validate required fields and types
    const clerkUserId =
      typeof body.clerk_user_id === "string" ? body.clerk_user_id.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const clientToken =
      typeof body.token === "string" ? body.token.trim() : "";

    if (!clerkUserId || !email) {
      return NextResponse.json(
        { error: "clerk_user_id and email are required" },
        { status: 400 }
      );
    }

    if (!clientToken) {
      return NextResponse.json(
        { error: "token is required – call getToken({ template:'api', skipCache:true }) on the client" },
        { status: 400 }
      );
    }

    // 3. Ensure the body's clerk_user_id matches the authenticated session
    if (clerkUserId !== userId) {
      console.warn(
        `[clerk-sync] clerk_user_id mismatch: body="${clerkUserId}" session="${userId}"`,
      );
      return NextResponse.json(
        { error: "clerk_user_id does not match authenticated session" },
        { status: 403 }
      );
    }

    // 4. Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // DEBUG: Log request summary for troubleshooting
    console.log("[clerk-sync] Incoming request", {
      sessionUserId: userId,
      bodyClerkUserId: clerkUserId,
      bodyEmail: email,
      hasClientToken: Boolean(clientToken),
      clientTokenPreview: `${clientToken.slice(0, 16)}...`,
    });

    // 5. Forward only the expected fields to Django backend.
    //    Use the client-provided token directly (fresh, skipCache:true)
    //    instead of server-side getToken which may serve a cached/stale JWT.
    const backendResponse = await backendFetchWithToken(
      `${BACKEND_URL}/api/auth/clerk-sync/`,
      clientToken,
      {
        method: "POST",
        body: JSON.stringify({ clerk_user_id: clerkUserId, email }),
      },
      cookies
    );

    const data = await backendResponse.json().catch(() => ({}));

    // DEBUG: Log backend response status and data
    console.log("[clerk-sync] Backend response", {
      status: backendResponse.status,
      data,
    });

    // Create response with same status as backend
    const response = NextResponse.json(data, {
      status: backendResponse.status,
    });

    // Forward Set-Cookie headers from backend if any
    forwardCookiesToResponse(backendResponse, response);

    return response;
  } catch (error) {
    console.error("Clerk sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync user with backend" },
      { status: 500 }
    );
  }
}
