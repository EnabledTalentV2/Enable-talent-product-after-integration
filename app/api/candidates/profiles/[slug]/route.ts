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
    const cookies = request.headers.get("cookie") || "";
    const { slug } = await context.params;
    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");
    const body = isMultipart ? await request.formData() : await request.json();

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateProfiles.detail(slug),
      {
        method: "PUT",
        body: isMultipart ? body : JSON.stringify(body),
      },
      cookies
    );

    const data = await backendResponse.json().catch(() => ({}));

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
    const cookies = request.headers.get("cookie") || "";
    const { slug } = await context.params;
    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");
    const body = isMultipart ? await request.formData() : await request.json();

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateProfiles.detail(slug),
      {
        method: "PATCH",
        body: isMultipart ? body : JSON.stringify(body),
      },
      cookies
    );

    const data = await backendResponse.json().catch(() => ({}));

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
