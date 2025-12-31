import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookies = request.headers.get("cookie") || "";

    // Forward the signup request to Django backend
    const backendResponse = await backendFetch(
      API_ENDPOINTS.auth.signup,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      cookies
    );

    const data = await backendResponse.json();

    // Create response with same status as backend
    const response = NextResponse.json(data, {
      status: backendResponse.status,
    });

    // Forward Set-Cookie headers from backend if any
    const setCookie = backendResponse.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("Set-Cookie", setCookie);
    }

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to connect to authentication service" },
      { status: 500 }
    );
  }
}
