import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

/**
 * GET /api/candidates/job-invites
 * Fetch candidate's pending job invites
 * Proxies to: /api/candidates/job-invites/
 */
export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";
    console.log(
      "[Candidate Invites API] GET ->",
      API_ENDPOINTS.candidateInvites.list
    );

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateInvites.list,
      { method: "GET" },
      cookies
    );

    console.log(
      "[Candidate Invites API] GET <- Status:",
      backendResponse.status
    );

    const responseText = await backendResponse.text();

    if (backendResponse.status >= 400) {
      console.error(
        "[Candidate Invites API] Backend error response:",
        responseText.substring(0, 1000)
      );
    }

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : [];
    } catch (parseError) {
      console.error(
        "[Candidate Invites API] Failed to parse backend response as JSON"
      );
      data = {
        error: "Backend returned non-JSON response",
        details: responseText.substring(0, 200),
        status: backendResponse.status,
      };
    }

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("[Candidate Invites API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch job invites" },
      { status: 500 }
    );
  }
}
