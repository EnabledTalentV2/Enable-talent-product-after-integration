import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");
    const body = isMultipart ? await request.formData() : await request.json();
    const { id: organizationId } = await params;

    console.log(
      "[Organizations API] PUT ->",
      `${API_ENDPOINTS.organizations.list}${organizationId}/`,
      { multipart: isMultipart }
    );

    const backendResponse = await backendFetch(
      `${API_ENDPOINTS.organizations.list}${organizationId}/`,
      {
        method: "PUT",
        body: isMultipart ? body : JSON.stringify(body),
      },
      cookies
    );

    const data = await backendResponse.json().catch(() => ({}));
    console.log("[Organizations API] PUT <-", backendResponse.status);

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Update organization error:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");
    const body = isMultipart ? await request.formData() : await request.json();
    const { id: organizationId } = await params;

    console.log(
      "[Organizations API] PATCH ->",
      `${API_ENDPOINTS.organizations.list}${organizationId}/`,
      { multipart: isMultipart }
    );

    const backendResponse = await backendFetch(
      `${API_ENDPOINTS.organizations.list}${organizationId}/`,
      {
        method: "PATCH",
        body: isMultipart ? body : JSON.stringify(body),
      },
      cookies
    );

    const data = await backendResponse.json().catch(() => ({}));
    console.log("[Organizations API] PATCH <-", backendResponse.status);

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Update organization error:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}
