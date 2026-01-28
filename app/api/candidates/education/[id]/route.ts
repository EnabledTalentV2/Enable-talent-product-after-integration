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
      API_ENDPOINTS.candidateData.educationDetail(id),
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
      cookies
    );

    if (backendResponse.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await backendResponse.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Update candidate education error:", error);
    return NextResponse.json(
      { error: "Failed to update candidate education" },
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
      API_ENDPOINTS.candidateData.educationDetail(id),
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
    console.error("Update candidate education error:", error);
    return NextResponse.json(
      { error: "Failed to update candidate education" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const { id } = await context.params;

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateData.educationDetail(id),
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
    console.error("Delete candidate education error:", error);
    return NextResponse.json(
      { error: "Failed to delete candidate education" },
      { status: 500 }
    );
  }
}
