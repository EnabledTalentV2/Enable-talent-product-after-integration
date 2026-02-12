import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const isDebugEnabled = () =>
  process.env.NODE_ENV !== "production" &&
  process.env.DEBUG_RANKING_DATA_API === "true";

const debugLog = (...args: unknown[]) => {
  if (isDebugEnabled()) console.log(...args);
};

const debugError = (...args: unknown[]) => {
  if (isDebugEnabled()) console.error(...args);
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const { id } = await context.params;

    debugLog("[Ranking Data API] Request for job ID:", id);
    debugLog(
      "[Ranking Data API] Backend URL:",
      API_ENDPOINTS.jobs.rankingData(id)
    );

    const backendResponse = await backendFetch(
      API_ENDPOINTS.jobs.rankingData(id),
      {
        method: "GET",
      },
      cookies
    );

    debugLog(
      "[Ranking Data API] Backend response status:",
      backendResponse.status
    );

    // If backend returns an error status, try to get text for debugging
    if (!backendResponse.ok) {
      const text = await backendResponse.text();
      debugError("[Ranking Data API] Backend error response (full):", text);

      return NextResponse.json(
        {
          error: "Backend returned an error",
          status: backendResponse.status,
          ranked_candidates: [],
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json().catch((err) => {
      console.error("[Ranking Data API] Failed to parse response:", err);
      return {
        ranked_candidates: [],
      };
    });

    debugLog("[Ranking Data API] Backend response data:", data);
    debugLog(
      "[Ranking Data API] First candidate from backend:",
      data.ranked_candidates?.[0]
    );
    debugLog(
      "[Ranking Data API] Has application_id?:",
      data.ranked_candidates?.[0]?.hasOwnProperty("application_id")
    );

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("[Ranking Data API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch ranking data",
        ranked_candidates: [],
      },
      { status: 500 }
    );
  }
}
