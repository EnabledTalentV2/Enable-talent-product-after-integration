import { NextRequest, NextResponse } from "next/server";
import {
  API_ENDPOINTS,
  backendFetch,
  forwardCookiesToResponse,
} from "@/lib/api-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookies = request.headers.get("cookie") || "";

    // Forward the login request to Django backend
    const backendResponse = await backendFetch(
      API_ENDPOINTS.auth.login,
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

    // Forward Set-Cookie headers from backend (contains HttpOnly JWT)
    forwardCookiesToResponse(backendResponse, response);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to connect to authentication service" },
      { status: 500 }
    );
  }
}
