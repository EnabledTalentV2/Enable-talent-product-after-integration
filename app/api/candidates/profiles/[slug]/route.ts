import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

type RouteContext = {
  params: { slug: string };
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const slug = context.params.slug;

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateProfiles.detail(slug),
      {
        method: "GET",
      },
      cookies
    );

    const data = await backendResponse.json();

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Get candidate profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidate profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const body = await request.json();
    const cookies = request.headers.get("cookie") || "";
    const slug = context.params.slug;

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateProfiles.detail(slug),
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
      cookies
    );

    const data = await backendResponse.json();

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Update candidate profile error:", error);
    return NextResponse.json(
      { error: "Failed to update candidate profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const body = await request.json();
    const cookies = request.headers.get("cookie") || "";
    const slug = context.params.slug;

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateProfiles.detail(slug),
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
      cookies
    );

    const data = await backendResponse.json();

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Patch candidate profile error:", error);
    return NextResponse.json(
      { error: "Failed to update candidate profile" },
      { status: 500 }
    );
  }
}
