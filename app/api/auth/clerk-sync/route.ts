import { NextRequest, NextResponse } from "next/server";
import {
  BACKEND_URL,
  backendFetch,
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
 *   email: string            // User's email address
 * }
 *
 * Response:
 * {
 *   id: number,              // Django user ID
 *   clerk_user_id: string,
 *   email: string,
 *   is_candidate: boolean,
 *   is_employer: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookies = request.headers.get("cookie") || "";

    // Validate required fields
    if (!body.clerk_user_id || !body.email) {
      return NextResponse.json(
        { error: "clerk_user_id and email are required" },
        { status: 400 }
      );
    }

    // Forward the sync request to Django backend
    const backendResponse = await backendFetch(
      `${BACKEND_URL}/api/auth/clerk-sync/`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      cookies
    );

    const data = await backendResponse.json().catch(() => ({}));

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
