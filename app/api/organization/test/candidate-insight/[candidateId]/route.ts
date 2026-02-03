import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

/**
 * GET /api/organization/test/candidate-insight/[candidateId]
 * Fetch employer insight for a candidate
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const { candidateId } = await params;
    const cookies = request.headers.get("cookie") || "";

    let backendResponse = await backendFetch(
      API_ENDPOINTS.organizations.candidateInsight(candidateId),
      { method: "GET" },
      cookies
    );

    if (backendResponse.status === 405) {
      backendResponse = await backendFetch(
        API_ENDPOINTS.organizations.candidateInsight(candidateId),
        {
          method: "POST",
          body: JSON.stringify({ candidate_id: candidateId }),
        },
        cookies
      );
    }

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(
        `[GET /api/organization/test/candidate-insight/${candidateId}] Backend error:`,
        backendResponse.status,
        errorText
      );

      let errorData: { detail?: string; error?: string; message?: string };
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || "Failed to fetch candidate insight" };
      }

      const errorMessage =
        errorData.detail ||
        errorData.error ||
        errorData.message ||
        "Failed to fetch candidate insight";

      return NextResponse.json(
        { error: errorMessage, detail: errorMessage },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "[GET /api/organization/test/candidate-insight/[candidateId]] Error:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
