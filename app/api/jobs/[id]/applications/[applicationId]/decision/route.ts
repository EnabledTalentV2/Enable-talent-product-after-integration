import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  try {
    const { id: jobId, applicationId } = await params;

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

    // Parse request body
    const body = await request.json();

    const backendUrl = `${BACKEND_URL}/api/channels/jobs/${jobId}/applications/${applicationId}/decision/`;
    console.log("Posting decision to:", backendUrl);
    console.log("Decision payload:", body);

    // Post decision to backend
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
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
        { error: errorData.detail || "Failed to update decision" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Successfully updated decision:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating decision:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
