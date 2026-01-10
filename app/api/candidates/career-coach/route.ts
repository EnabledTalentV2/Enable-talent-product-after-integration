import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

export async function POST(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const body = await request.json();

    console.log("[API Route] Career coach request body:", body);

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateProfiles.careerCoach,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      cookies
    );

    console.log("[API Route] Backend response status:", backendResponse.status);

    const data = await backendResponse.json().catch((err) => {
      console.error("[API Route] Failed to parse backend response:", err);
      return {};
    });

    console.log("[API Route] Backend response data:", data);

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("[API Route] Career coach error:", error);
    return NextResponse.json(
      { error: "Failed to send message to career coach" },
      { status: 500 }
    );
  }
}
