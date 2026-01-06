import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const { slug } = await context.params;

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateProfiles.parsingStatus(slug),
      {
        method: "GET",
      },
      cookies
    );

    const data = await backendResponse.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Parsing status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch parsing status." },
      { status: 500 }
    );
  }
}
