import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

/**
 * CSRF Token endpoint
 * Fetches CSRF token from Django backend and forwards it to the client
 * The CSRF token is required for POST/PUT/DELETE requests
 */
export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";

    // Fetch CSRF token from Django backend
    const backendResponse = await backendFetch(
      API_ENDPOINTS.auth.csrf,
      {
        method: "GET",
      },
      cookies
    );

    const data = await backendResponse.json();

    // Create response with same status as backend
    const response = NextResponse.json(data, {
      status: backendResponse.status,
    });

    // Forward Set-Cookie headers (contains csrftoken)
    const setCookie = backendResponse.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("Set-Cookie", setCookie);
    }

    return response;
  } catch (error) {
    console.error("CSRF token error:", error);
    return NextResponse.json(
      { error: "Failed to fetch CSRF token" },
      { status: 500 }
    );
  }
}
