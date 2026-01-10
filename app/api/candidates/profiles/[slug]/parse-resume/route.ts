import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const { slug } = await context.params;

    console.log("[Parse Resume API] Request for slug:", slug);
    console.log("[Parse Resume API] Backend URL:", API_ENDPOINTS.candidateProfiles.parseResume(slug));

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateProfiles.parseResume(slug),
      {
        method: "POST",
      },
      cookies
    );

    console.log("[Parse Resume API] Backend response status:", backendResponse.status);

    // If backend returns an error status, try to get text for debugging
    if (!backendResponse.ok) {
      const text = await backendResponse.text();
      console.error("[Parse Resume API] Backend error response (full):", text);

      return NextResponse.json(
        {
          error: "Backend returned an error",
          status: backendResponse.status,
          message: "Resume parsing failed"
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json().catch((err) => {
      console.error("[Parse Resume API] Failed to parse response:", err);
      return {
        message: "Resume parsing completed but response format unexpected",
        parsing_status: "parsing"
      };
    });

    console.log("[Parse Resume API] Backend response data:", data);

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("[Parse Resume API] Error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume." },
      { status: 500 }
    );
  }
}
