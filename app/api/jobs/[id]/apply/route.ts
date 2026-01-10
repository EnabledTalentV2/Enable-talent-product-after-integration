import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api-config";

/**
 * POST /api/jobs/[id]/apply
 * Candidate applies to a job
 * Proxies to: /api/channels/jobs/{job_id}/apply/
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    // Build backend URL
    const backendEndpoint = `${BACKEND_URL}/api/channels/jobs/${jobId}/apply/`;

    // Get auth token from cookies
    const cookies = request.headers.get("cookie") || "";
    const tokenMatch = cookies.match(/access_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Make request to backend
    const response = await fetch(backendEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}), // Empty payload as per API spec
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      return NextResponse.json(
        { error: "Failed to submit application" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error applying to job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
