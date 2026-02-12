import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, backendFetch } from "@/lib/api-config";

export async function POST(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; applicationId: string }> },
) {
  try {
    const { id: jobId, applicationId } = await params;
    const cookies = request.headers.get("cookie") || "";
    const body = await request.json();
    const backendUrl = `${BACKEND_URL}/api/channels/jobs/${jobId}/applications/${applicationId}/decision/`;

    console.log("[jobs/application-decision] POST ->", backendUrl, body);

    const backendResponse = await backendFetch(
      backendUrl,
      {
        method: "POST",
        body: JSON.stringify(body),
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
      console.error("[jobs/application-decision] Backend error", {
        status: backendResponse.status,
        bodyPreview:
          typeof responseText === "string" ? responseText.slice(0, 1000) : null,
      });
    }

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error("[jobs/application-decision] POST error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
