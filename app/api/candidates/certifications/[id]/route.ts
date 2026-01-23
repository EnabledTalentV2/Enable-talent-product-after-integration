import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const body = await request.json();
    const cookies = request.headers.get("cookie") || "";
    const { id } = await context.params;

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateData.certificationsDetail(id),
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
      cookies
    );

    const data = await backendResponse.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Update candidate certification error:", error);
    return NextResponse.json(
      { error: "Failed to update candidate certification" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const body = await request.json();
    const cookies = request.headers.get("cookie") || "";
    const { id } = await context.params;

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateData.certificationsDetail(id),
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
      cookies
    );

    const data = await backendResponse.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Update candidate certification error:", error);
    return NextResponse.json(
      { error: "Failed to update candidate certification" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const { id } = await context.params;

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateData.certificationsDetail(id),
      {
        method: "DELETE",
      },
      cookies
    );

    const data = await backendResponse.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Delete candidate certification error:", error);
    return NextResponse.json(
      { error: "Failed to delete candidate certification" },
      { status: 500 }
    );
  }
}
