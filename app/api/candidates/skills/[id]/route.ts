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
      API_ENDPOINTS.candidateData.skillsDetail(id),
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
    console.error("Update candidate skill error:", error);
    return NextResponse.json(
      { error: "Failed to update candidate skill" },
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
      API_ENDPOINTS.candidateData.skillsDetail(id),
      {
        method: "PATCH",
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
    console.error("Update candidate skill error:", error);
    return NextResponse.json(
      { error: "Failed to update candidate skill" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const { id } = await context.params;

    const backendResponse = await backendFetch(
      API_ENDPOINTS.candidateData.skillsDetail(id),
      {
        method: "DELETE",
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
    console.error("Delete candidate skill error:", error);
    return NextResponse.json(
      { error: "Failed to delete candidate skill" },
      { status: 500 }
    );
  }
}
