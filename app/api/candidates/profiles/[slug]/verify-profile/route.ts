import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const body = await request.text(); // keep raw text (prevents json parsing issues)
    const cookie = request.headers.get("cookie") ?? "";
    const csrf = request.headers.get("x-csrftoken") ?? "";

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateProfiles.verifyProfile(slug), // ensure this returns trailing slash
      {
        method: "POST",
        headers: {
          "Content-Type": request.headers.get("content-type") ?? "application/json",
          "X-CSRFToken": csrf,
        },
        body,
      },
      cookie
    );

    const responseText = await backendResponse.text();

    // Helpful logs while debugging:
    console.log("verify-profile upstream status:", backendResponse.status);
    console.log("verify-profile upstream content-type:", backendResponse.headers.get("content-type"));
    console.log("verify-profile upstream body:", responseText);

    return new NextResponse(responseText, {
      status: backendResponse.status,
      headers: {
        "Content-Type": backendResponse.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("Verify profile proxy error:", error);
    return NextResponse.json(
      { error: "Failed to verify profile." },
      { status: 500 }
    );
  }
}
