import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const { jobId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const url = API_ENDPOINTS.organizations.jobInvite(jobId);

    console.log("[Job Invite API] POST ->", url, body);

    const backendResponse = await backendFetch(
      url,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      cookies
    );

    console.log(
      "[Job Invite API] Backend response status:",
      backendResponse.status
    );

    const responseText = await backendResponse.text();

    if (backendResponse.status >= 400) {
      console.error(
        "[Job Invite API] Backend error response:",
        responseText.substring(0, 1000)
      );
    }

    if (!responseText) {
      return new NextResponse(null, { status: backendResponse.status });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("[Job Invite API] Failed to parse backend response as JSON");
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
    console.error("[Job Invite API] Error:", error);
    return NextResponse.json(
      { error: "Failed to send invite" },
      { status: 500 }
    );
  }
}
