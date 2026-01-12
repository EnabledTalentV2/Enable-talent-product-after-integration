import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    // Get cookies for authentication
    const cookies = request.cookies;
    const accessToken = cookies.get("access_token")?.value;

    if (!accessToken) {
      console.error("No access token found in cookies");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const backendUrl = `${BACKEND_URL}/api/channels/jobs/${jobId}/applications/`;
    console.log("Fetching applications from:", backendUrl);

    // Fetch applications from backend
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error response:", errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText };
      }

      return NextResponse.json(
        { error: errorData.detail || "Failed to fetch applications" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Successfully fetched applications:", data.length || 0, "items");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
