import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";
import { validateImageFile } from "@/lib/upload-validation";

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";
    console.log(
      "[Organizations API] GET ->",
      API_ENDPOINTS.organizations.list
    );

    const backendResponse = await backendFetch(
      API_ENDPOINTS.organizations.list,
      {
        method: "GET",
      },
      cookies
    );

    const data = await backendResponse.json();
    console.log("[Organizations API] GET <-", backendResponse.status);

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Get organizations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
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

    if (isMultipart) {
      const avatar = (body as FormData).get("avatar");
      if (avatar instanceof File) {
        const result = await validateImageFile(avatar);
        if (!result.valid) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
      }
    }

    console.log(
      "[Organizations API] POST ->",
      API_ENDPOINTS.organizations.list,
      { multipart: isMultipart }
    );

    const backendResponse = await backendFetch(
      API_ENDPOINTS.organizations.list,
      {
        method: "POST",
        body: isMultipart ? body : JSON.stringify(body),
      },
      cookies
    );

    const data = await backendResponse.json().catch(() => ({}));
    console.log("[Organizations API] POST <-", backendResponse.status);

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Create organization error:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
