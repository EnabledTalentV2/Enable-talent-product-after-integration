import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookies = request.headers.get("cookie") || "";

    // Forward the resend verification request to Django backend
    const backendResponse = await backendFetch(
      API_ENDPOINTS.auth.resendVerification,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      cookies
    );

    const data = await backendResponse.json();

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to resend verification email." },
      { status: 500 }
    );
  }
}
