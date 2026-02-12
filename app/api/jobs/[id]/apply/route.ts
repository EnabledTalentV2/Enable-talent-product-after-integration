import { NextResponse } from "next/server";
import { BACKEND_URL, backendFetch } from "@/lib/api-config";

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
    const cookies = request.headers.get("cookie") || "";

    // Build backend URL
    const backendEndpoint = `${BACKEND_URL}/api/channels/jobs/${jobId}/apply/`;

    // Make request to backend
    const response = await backendFetch(
      backendEndpoint,
      {
        method: "POST",
        body: JSON.stringify({}), // Empty payload as per API spec
      },
      cookies
    );

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
