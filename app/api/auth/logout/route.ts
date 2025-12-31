import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

export async function POST(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";

    // Forward the logout request to Django backend
    const backendResponse = await backendFetch(
      API_ENDPOINTS.auth.logout,
      {
        method: "POST",
      },
      cookies
    );

    const data = await backendResponse.json().catch(() => ({ ok: true }));

    // Create response with same status as backend
    const response = NextResponse.json(data, {
      status: backendResponse.status,
    });

    // Forward Set-Cookie headers from backend (clears the JWT cookie)
    const setCookie = backendResponse.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("Set-Cookie", setCookie);
    }

    // Also clear any local cookies as fallback
    response.cookies.set({
      name: "token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    // Even if backend fails, clear local cookie
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: "token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });
    return response;
  }
}
