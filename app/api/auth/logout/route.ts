import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

// Cookie names to clear (must match AUTH_COOKIE_NAMES in proxy.ts)
const AUTH_COOKIE_NAMES = ["access_token", "jwt", "token", "sessionid"];

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

    // Clear ALL possible auth cookies as fallback
    for (const cookieName of AUTH_COOKIE_NAMES) {
      response.cookies.set({
        name: cookieName,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
      });
    }

    // Also clear user_role cookie if it exists
    response.cookies.set({
      name: "user_role",
      value: "",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    // Even if backend fails, clear all local cookies
    const response = NextResponse.json({ ok: true });

    for (const cookieName of AUTH_COOKIE_NAMES) {
      response.cookies.set({
        name: cookieName,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
      });
    }

    response.cookies.set({
      name: "user_role",
      value: "",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  }
}
