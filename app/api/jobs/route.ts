import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";
    console.log("[Jobs API] GET ->", API_ENDPOINTS.jobs.list);

    const backendResponse = await backendFetch(
      API_ENDPOINTS.jobs.list,
      {
        method: "GET",
      },
      cookies
    );

    console.log("[Jobs API] GET <- Status:", backendResponse.status);

    // Get response text first, then try to parse as JSON
    const responseText = await backendResponse.text();

    if (backendResponse.status >= 400) {
      console.error("[Jobs API] Backend error response:", responseText.substring(0, 1000));
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("[Jobs API] Parsed response data");
    } catch (parseError) {
      console.error("[Jobs API] Failed to parse backend response as JSON");
      console.error("[Jobs API] Response text:", responseText.substring(0, 500));
      data = {
        error: "Backend returned non-JSON response",
        details: responseText.substring(0, 200),
        status: backendResponse.status
      };
    }

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("[Jobs API] Get jobs error:", error);
    console.error("[Jobs API] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
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

    console.log("[Jobs API] POST ->", API_ENDPOINTS.jobs.list, {
      multipart: isMultipart,
      body: body,
    });

    const backendResponse = await backendFetch(
      API_ENDPOINTS.jobs.list,
      {
        method: "POST",
        body: isMultipart ? body : JSON.stringify(body),
      },
      cookies
    );

    console.log("[Jobs API] Backend response status:", backendResponse.status);

    // Get response text first, then try to parse as JSON
    const responseText = await backendResponse.text();

    if (backendResponse.status >= 400) {
      console.error("[Jobs API] Backend error response (first 1000 chars):", responseText.substring(0, 1000));
    } else {
      console.log("[Jobs API] Backend raw response (first 500 chars):", responseText.substring(0, 500));
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("[Jobs API] Backend response data:", data);
    } catch (parseError) {
      console.error("[Jobs API] Failed to parse backend response as JSON");
      console.error("[Jobs API] Full error response:", responseText);
      data = {
        error: "Backend returned non-JSON response",
        details: responseText.substring(0, 500),
        status: backendResponse.status
      };
    }

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("[Jobs API] Create job error:", error);
    console.error("[Jobs API] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
