import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";

    // Forward the request to Django backend to get current user data
    const backendResponse = await backendFetch(
      API_ENDPOINTS.users.me,
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
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const cookies = request.headers.get("cookie") || "";

    // Forward the update request to Django backend
    const backendResponse = await backendFetch(
      API_ENDPOINTS.users.me,
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
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const cookies = request.headers.get("cookie") || "";

    // Forward the partial update request to Django backend
    const backendResponse = await backendFetch(
      API_ENDPOINTS.users.me,
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
    console.error("Patch user error:", error);
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";

    const meResponse = await backendFetch(
      API_ENDPOINTS.users.me,
      { method: "GET" },
      cookies
    );

    const meData = await meResponse.json().catch(() => ({}));

    if (!meResponse.ok) {
      return NextResponse.json(meData, { status: meResponse.status });
    }

    const userId =
      meData && typeof meData === "object" && "id" in meData
        ? String((meData as { id: string | number }).id)
        : null;

    if (!userId) {
      return NextResponse.json(
        { error: "Unable to resolve user account for deletion" },
        { status: 400 }
      );
    }

    const backendResponse = await backendFetch(
      API_ENDPOINTS.users.detail(userId),
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
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user account" },
      { status: 500 }
    );
  }
}
