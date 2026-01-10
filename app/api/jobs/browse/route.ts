import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api-config";

/**
 * GET /api/jobs/browse
 * Candidate job browsing endpoint
 * Proxies to: /api/channels/jobs/browse/
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Build backend URL
    const backendEndpoint = new URL(`${BACKEND_URL}/api/channels/jobs/browse/`);

    // Forward query parameters
    searchParams.forEach((value, key) => {
      backendEndpoint.searchParams.set(key, value);
    });

    // Get auth token from cookies
    const cookies = request.headers.get("cookie") || "";
    const tokenMatch = cookies.match(/access_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    // Make request to backend
    const response = await fetch(backendEndpoint.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch job listings" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching candidate job listings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
