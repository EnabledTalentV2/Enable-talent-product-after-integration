import { NextResponse } from "next/server";
import { BACKEND_URL, backendFetch } from "@/lib/api-config";

/**
 * GET /api/candidate/applications/
 * Fetch candidate's job applications
 * Proxies to: /api/channels/candidate/applications/
 */
export async function GET(request: Request) {
  try {
    const cookies = request.headers.get("cookie") || "";

    // Build backend URL
    const backendEndpoint = `${BACKEND_URL}/api/channels/candidate/applications/`;

    // Make request to backend
    const response = await backendFetch(
      backendEndpoint,
      {
        method: "GET",
      },
      cookies
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error response:", {
        status: response.status,
        statusText: response.statusText,
        url: backendEndpoint,
        error: errorText,
      });
      return NextResponse.json(
        { error: "Failed to fetch applications", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Successfully fetched applications:", data.length, "items");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching candidate applications:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
