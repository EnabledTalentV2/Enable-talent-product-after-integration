import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

export async function POST(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const body = await request.json();

    console.log("[AI Agent Search API] Request body:", body);

    const backendResponse = await backendFetch(
      API_ENDPOINTS.agent.search,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      cookies
    );

    console.log(
      "[AI Agent Search API] Backend response status:",
      backendResponse.status
    );

    // If backend returns an error status, try to get text for debugging
    if (!backendResponse.ok) {
      const text = await backendResponse.text();
      console.error(
        "[AI Agent Search API] Backend error response (full):",
        text
      );

      return NextResponse.json(
        {
          error: "Backend returned an error",
          status: backendResponse.status,
          results: {
            candidates: [],
            reasoning: "Search failed. Please try again.",
          },
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json().catch((err) => {
      console.error("[AI Agent Search API] Failed to parse response:", err);
      return {
        results: {
          candidates: [],
          reasoning: "Search completed but response format unexpected",
        },
      };
    });

    console.log("[AI Agent Search API] Backend response data:", data);

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("[AI Agent Search API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to perform AI search",
        results: {
          candidates: [],
          reasoning: "An error occurred during search",
        },
      },
      { status: 500 }
    );
  }
}
