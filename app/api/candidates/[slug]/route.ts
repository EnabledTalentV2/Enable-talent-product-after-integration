import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

/**
 * GET /api/candidates/[slug]
 * Fetch a single candidate profile by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cookies = request.headers.get("cookie") || "";

    // Fetch candidate profile from backend
    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateProfiles.detail(slug),
      { method: "GET" },
      cookies
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(
        `[GET /api/candidates/${slug}] Backend error:`,
        backendResponse.status,
        errorText
      );

      // Try to parse the error as JSON to pass through the actual error message
      let errorData: { detail?: string; error?: string; message?: string };
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || "Failed to fetch candidate profile" };
      }

      // Pass through auth-related error messages for proper session expiry detection
      const errorMessage =
        errorData.detail || errorData.error || errorData.message || "Failed to fetch candidate profile";

      return NextResponse.json(
        { error: errorMessage, detail: errorMessage },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[GET /api/candidates/[slug]] Error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
