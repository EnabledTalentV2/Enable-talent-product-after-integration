import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const { slug } = await context.params;

    console.log("[Get Profile API] Request for slug:", slug);
    console.log("[Get Profile API] Backend URL:", API_ENDPOINTS.candidateProfiles.detail(slug));

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateProfiles.detail(slug),
      {
        method: "GET",
      },
      cookies
    );

    console.log("[Get Profile API] Backend response status:", backendResponse.status);

    const data = await backendResponse.json();

    console.log("[Get Profile API] Backend response data keys:", Object.keys(data));
    console.log("[Get Profile API] Has resume_data?", "resume_data" in data);
    console.log("[Get Profile API] Has verified_data?", "verified_data" in data);
    if (data.resume_data) {
      console.log("[Get Profile API] resume_data keys:", Object.keys(data.resume_data));
      console.log("[Get Profile API] resume_data:", JSON.stringify(data.resume_data, null, 2));
    }

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("[Get Profile API] Error:", error);
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
