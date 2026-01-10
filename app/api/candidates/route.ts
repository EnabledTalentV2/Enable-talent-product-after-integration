import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

/**
 * GET /api/candidates
 * Fetch all candidate profiles for employers
 * Proxies to: /api/candidates/profiles/
 */
export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";
    console.log("[Candidates API] GET ->", API_ENDPOINTS.candidateProfiles.list);

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateProfiles.list,
      {
        method: "GET",
      },
      cookies
    );

    console.log("[Candidates API] GET <- Status:", backendResponse.status);

    // Get response text first, then try to parse as JSON
    const responseText = await backendResponse.text();

    if (backendResponse.status >= 400) {
      console.error("[Candidates API] Backend error response:", responseText.substring(0, 1000));
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("[Candidates API] Parsed response - candidates count:", Array.isArray(data) ? data.length : 'unknown');
    } catch (parseError) {
      console.error("[Candidates API] Failed to parse backend response as JSON");
      console.error("[Candidates API] Response text:", responseText.substring(0, 500));
      data = {
        error: "Backend returned non-JSON response",
        details: responseText.substring(0, 500),
        status: backendResponse.status
      };
    }

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("[Candidates API] Get candidates error:", error);
    console.error("[Candidates API] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}
