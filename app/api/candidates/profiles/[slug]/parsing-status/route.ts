import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const { slug } = await context.params;
    const requestUrl = new URL(request.url);
    const includeResume =
      requestUrl.searchParams.get("include_resume") === "true";
    const backendUrl = new URL(
      API_ENDPOINTS.candidateProfiles.parsingStatus(slug)
    );
    if (includeResume) {
      backendUrl.searchParams.set("include_resume", "true");
    }

    console.log("[Parsing Status API] Request for slug:", slug);
    console.log("[Parsing Status API] Backend URL:", backendUrl.toString());

    const backendResponse = await backendFetch(
      backendUrl.toString(),
      {
        method: "GET",
      },
      cookies
    );

    console.log("[Parsing Status API] Backend response status:", backendResponse.status);

    // If backend returns an error status, try to get text for debugging
    if (!backendResponse.ok) {
      const text = await backendResponse.text();
      console.error("[Parsing Status API] Backend error response (full):", text);

      return NextResponse.json(
        {
          error: "Backend returned an error",
          status: backendResponse.status,
          parsing_status: "error",
          has_resume_data: false,
          resume_file_exists: false,
          has_verified_data: false
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json().catch((err) => {
      console.error("[Parsing Status API] Failed to parse response:", err);
      return {
        parsing_status: "error",
        has_resume_data: false,
        resume_file_exists: false,
        has_verified_data: false
      };
    });

    console.log("[Parsing Status API] Backend response data:", data);

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("[Parsing Status API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch parsing status.",
        parsing_status: "error",
        has_resume_data: false,
        resume_file_exists: false,
        has_verified_data: false
      },
      { status: 500 }
    );
  }
}
