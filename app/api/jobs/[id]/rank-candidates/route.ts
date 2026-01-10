import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const { id } = await context.params;

    console.log("[Rank Candidates API] Request for job ID:", id);
    console.log(
      "[Rank Candidates API] Backend URL:",
      API_ENDPOINTS.jobs.rankCandidates(id)
    );

    const backendResponse = await backendFetch(
      API_ENDPOINTS.jobs.rankCandidates(id),
      {
        method: "POST",
        body: JSON.stringify({}),
      },
      cookies
    );

    console.log(
      "[Rank Candidates API] Backend response status:",
      backendResponse.status
    );

    // If backend returns an error status, try to get text for debugging
    if (!backendResponse.ok) {
      const text = await backendResponse.text();
      console.error(
        "[Rank Candidates API] Backend error response (full):",
        text
      );

      return NextResponse.json(
        {
          error: "Backend returned an error",
          status: backendResponse.status,
          message: "Failed to trigger candidate ranking",
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json().catch((err) => {
      console.error("[Rank Candidates API] Failed to parse response:", err);
      return {
        message: "Ranking request submitted but response format unexpected",
        ranking_status: "ranking",
      };
    });

    console.log("[Rank Candidates API] Backend response data:", data);

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("[Rank Candidates API] Error:", error);
    return NextResponse.json(
      { error: "Failed to trigger candidate ranking" },
      { status: 500 }
    );
  }
}
