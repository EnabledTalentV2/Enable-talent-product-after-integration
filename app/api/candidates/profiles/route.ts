import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateProfiles.list,
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
    console.error("Get candidate profiles error:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidate profiles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");
    const body = isMultipart ? await request.formData() : await request.json();

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateProfiles.list,
      {
        method: "POST",
        body: isMultipart ? body : JSON.stringify(body),
      },
      cookies
    );

    const data = await backendResponse.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Create candidate profile error:", error);
    return NextResponse.json(
      { error: "Failed to create candidate profile" },
      { status: 500 }
    );
  }
}
