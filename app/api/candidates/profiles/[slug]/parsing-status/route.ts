import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

/**
 * GET /api/candidates/profiles/[slug]/parsing-status/
 *
 * Proxy to backend parsing status endpoint.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json(
        { error: "Candidate slug is required" },
        { status: 400 }
      );
    }

    const cookies = request.headers.get("cookie") || "";
    const backendEndpoint = new URL(API_ENDPOINTS.candidateProfiles.parsingStatus(slug));
    request.nextUrl.searchParams.forEach((value, key) => {
      backendEndpoint.searchParams.set(key, value);
    });

    console.log("[Parsing Status GET] Backend URL:", backendEndpoint.toString());

    const backendResponse = await backendFetch(
      backendEndpoint.toString(),
      { method: "GET" },
      cookies
    );

    console.log("[Parsing Status GET] Backend status:", backendResponse.status);

    // Get response as text first to see what we're getting
    const responseText = await backendResponse.text();
    console.log("[Parsing Status GET] Backend response body:", responseText);

    // Try to parse as JSON
    let data = {};
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("[Parsing Status GET] Failed to parse response as JSON:", e);
      data = { raw_response: responseText };
    }

    if (!backendResponse.ok) {
      console.error("[Parsing Status GET] Backend error response:", {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        body: data
      });
    }

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error("[Parsing Status GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch parsing status" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/candidates/profiles/[slug]/parsing-status/
 *
 * Proxy to backend parsing status endpoint.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json(
        { error: "Candidate slug is required" },
        { status: 400 }
      );
    }

    const cookies = request.headers.get("cookie") || "";
    const backendEndpoint = new URL(API_ENDPOINTS.candidateProfiles.parsingStatus(slug));
    request.nextUrl.searchParams.forEach((value, key) => {
      backendEndpoint.searchParams.set(key, value);
    });

    console.log("[Parsing Status DELETE] Backend URL:", backendEndpoint.toString());

    const backendResponse = await backendFetch(
      backendEndpoint.toString(),
      { method: "DELETE" },
      cookies
    );

    console.log("[Parsing Status DELETE] Backend status:", backendResponse.status);

    const responseText = await backendResponse.text();
    console.log("[Parsing Status DELETE] Backend response body:", responseText);

    let data = {};
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("[Parsing Status DELETE] Failed to parse response as JSON:", e);
      data = { raw_response: responseText };
    }

    if (!backendResponse.ok) {
      console.error("[Parsing Status DELETE] Backend error response:", {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        body: data
      });
    }

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error("[Parsing Status DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete parsing status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/candidates/profiles/[slug]/parsing-status/
 *
 * Proxy to backend parsing status endpoint.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json(
        { error: "Candidate slug is required" },
        { status: 400 }
      );
    }

    const cookies = request.headers.get("cookie") || "";
    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");
    const body = isMultipart ? await request.formData() : await request.json().catch(() => ({}));

    const backendEndpoint = new URL(API_ENDPOINTS.candidateProfiles.parsingStatus(slug));
    request.nextUrl.searchParams.forEach((value, key) => {
      backendEndpoint.searchParams.set(key, value);
    });

    console.log("[Parsing Status POST] Backend URL:", backendEndpoint.toString());

    const backendResponse = await backendFetch(
      backendEndpoint.toString(),
      {
        method: "POST",
        body: isMultipart ? body : JSON.stringify(body),
      },
      cookies
    );

    console.log("[Parsing Status POST] Backend status:", backendResponse.status);

    const responseText = await backendResponse.text();
    console.log("[Parsing Status POST] Backend response body:", responseText);

    let data = {};
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("[Parsing Status POST] Failed to parse response as JSON:", e);
      data = { raw_response: responseText };
    }

    if (!backendResponse.ok) {
      console.error("[Parsing Status POST] Backend error response:", {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        body: data
      });
    }

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error("[Parsing Status POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to post parsing status" },
      { status: 500 }
    );
  }
}
