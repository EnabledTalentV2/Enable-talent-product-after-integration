import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

export async function POST(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const body = await request.json();

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateProfiles.resumePrompt,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      cookies
    );

    const data = await backendResponse.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Resume prompt error:", error);
    return NextResponse.json(
      { error: "Failed to process resume prompt" },
      { status: 500 }
    );
  }
}
