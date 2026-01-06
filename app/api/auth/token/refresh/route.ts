import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch, forwardCookiesToResponse } from "@/lib/api-config";

export async function POST(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";

    const backendResponse = await backendFetch(
      API_ENDPOINTS.auth.tokenRefresh,
      {
        method: "POST",
      },
      cookies
    );

    const data = await backendResponse.json().catch(() => ({}));
    const response = NextResponse.json(data, {
      status: backendResponse.status,
    });

    forwardCookiesToResponse(backendResponse, response);

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { error: "Failed to refresh session." },
      { status: 500 }
    );
  }
}
