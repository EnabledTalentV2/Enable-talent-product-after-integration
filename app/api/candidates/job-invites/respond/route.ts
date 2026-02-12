import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

/**
 * POST /api/candidates/job-invites/respond
 * Respond to a job invite (accept / reject)
 * Proxies to: /api/candidates/job-invites/respond/
 */
export async function POST(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const body = await request.json().catch(() => ({}));

    console.log(
      "[Candidate Invites API] POST ->",
      API_ENDPOINTS.candidateInvites.respond,
      body
    );

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateInvites.respond,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      cookies
    );

    console.log(
      "[Candidate Invites API] POST <- Status:",
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
      data = responseText ? JSON.parse(responseText) : {};
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
      { error: "Failed to respond to job invite" },
      { status: 500 }
    );
  }
}
