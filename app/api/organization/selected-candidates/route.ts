import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

const getCookieValue = (cookieHeader: string, name: string): string | null => {
  if (!cookieHeader) return null;
  const entries = cookieHeader.split(";").map((entry) => entry.trim());
  for (const entry of entries) {
    if (!entry) continue;
    const [key, ...rest] = entry.split("=");
    if (key === name) {
      return rest.join("=") ? decodeURIComponent(rest.join("=")) : "";
    }
  }
  return null;
};

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const backendUrl = API_ENDPOINTS.organizations.selectedCandidates;
    console.log("[Selected Candidates API] Proxying to backend:", backendUrl);
    console.log("[Selected Candidates API] Cookies present:", !!cookies);

    const authHeader = request.headers.get("authorization");
    const cookieNames = cookies
      .split(";")
      .map((entry) => entry.trim().split("=")[0])
      .filter(Boolean);
    const accessToken = getCookieValue(cookies, "access_token");

    console.log(
      "[Selected Candidates API] Authorization header present:",
      Boolean(authHeader),
    );
    console.log("[Selected Candidates API] Cookie names:", [
      ...new Set(cookieNames),
    ]);
    console.log(
      "[Selected Candidates API] access_token present:",
      Boolean(accessToken),
    );

    const backendResponse = await backendFetch(
      backendUrl,
      {
        method: "GET",
      },
      cookies,
    );

    console.log(
      "[Selected Candidates API] GET <- Status:",
      backendResponse.status,
    );

    const responseText = await backendResponse.text();

    if (backendResponse.status >= 400) {
      console.error(
        "[Selected Candidates API] Backend error response:",
        responseText.substring(0, 1000),
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("[Selected Candidates API] Parsed response data");
    } catch (parseError) {
      console.error(
        "[Selected Candidates API] Failed to parse backend response as JSON",
      );
      console.error(
        "[Selected Candidates API] Response text:",
        responseText.substring(0, 500),
      );
      data = {
        error: "Backend returned non-JSON response",
        details: responseText.substring(0, 200),
        status: backendResponse.status,
      };
    }

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error(
      "[Selected Candidates API] Get selected candidates error:",
      error,
    );
    console.error("[Selected Candidates API] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to fetch selected candidates" },
      { status: 500 },
    );
  }
}
