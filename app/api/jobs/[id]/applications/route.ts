import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, backendFetch } from "@/lib/api-config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: jobId } = await params;
    const cookies = request.headers.get("cookie") || "";
    const backendUrl = `${BACKEND_URL}/api/channels/jobs/${jobId}/applications/`;

    console.log("[jobs/applications] GET ->", backendUrl);

    const backendResponse = await backendFetch(
      backendUrl,
      {
        method: "GET",
      },
      cookies,
    );

    const responseText = await backendResponse.text();
    let data: unknown = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = {
        error: "Backend returned non-JSON response",
        details: responseText.slice(0, 500),
      };
    }

    if (!backendResponse.ok) {
      console.error("[jobs/applications] Backend error", {
        status: backendResponse.status,
        bodyPreview:
          typeof responseText === "string" ? responseText.slice(0, 1000) : null,
      });
    }

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error("[jobs/applications] GET error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
