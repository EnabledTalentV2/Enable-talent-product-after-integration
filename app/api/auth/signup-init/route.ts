import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api-config";

/**
 * POST /api/auth/signup-init
 *
 * Option B: Temporary Signup Token System
 *
 * This endpoint initiates the signup process and returns a temporary token
 * that can be used for authenticated operations during signup (like resume parsing)
 * BEFORE the user fully completes registration.
 *
 * Flow:
 * 1. User enters basic info (email, password) on signup page
 * 2. Frontend calls this endpoint with basic credentials
 * 3. Backend creates a temporary/pending user and returns a short-lived token
 * 4. Frontend uses this token for resume parsing
 * 5. After resume parsing, user continues to full signup endpoint
 *
 * Expected Backend Request:
 * {
 *   "email": "user@example.com",
 *   "password": "securepassword"
 * }
 *
 * Expected Backend Response:
 * {
 *   "temporary_token": "eyJ...",
 *   "expires_in": 3600, // seconds
 *   "user_id": "temp-uuid" // temporary user ID
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("[signup-init] Initiating signup for:", body.email);

    // Call backend to initialize signup and get temporary token
    const response = await fetch(API_ENDPOINTS.auth.signupInit, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    });

    // Get response data
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[signup-init] Backend error:", response.status, data);

      // Return specific error messages from backend
      return NextResponse.json(
        {
          error: data.detail || data.message || "Failed to initialize signup",
          details: data,
        },
        { status: response.status }
      );
    }

    console.log("[signup-init] Successfully obtained temporary token");

    // Return temporary token to frontend
    return NextResponse.json({
      temporary_token: data.temporary_token,
      expires_in: data.expires_in || 3600,
      user_id: data.user_id,
      message:
        "Signup initialized. Use the temporary token for resume parsing.",
    });
  } catch (error) {
    console.error("[signup-init] Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error during signup initialization",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
