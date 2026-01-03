import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api-config";

/**
 * POST /api/resume/parse
 *
 * Option B: Uses temporary signup token for authentication during signup flow.
 *
 * The request can include:
 * - FormData with 'file' (the resume file)
 * - Header 'X-Signup-Token' (temporary token from /api/auth/signup-init)
 *
 * If X-Signup-Token is provided, it will be used for authentication.
 * Otherwise, falls back to cookie-based session authentication.
 */
export async function POST(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const temporaryToken = request.headers.get("X-Signup-Token");
    const candidateSlug = request.headers.get("X-Candidate-Slug");

    if (!candidateSlug) {
      return NextResponse.json(
        { error: "Candidate slug not provided", success: false },
        { status: 400 }
      );
    }

    // Get the form data from the request (contains the file)
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided", success: false },
        { status: 400 }
      );
    }

    // Create a new FormData to send to Django backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    // Build headers for backend request
    const headers: HeadersInit = {};

    if (temporaryToken) {
      // Option B: Use temporary signup token for authentication
      console.log(
        "[resume/parse] Using temporary signup token for authentication"
      );
      headers["Authorization"] = `Bearer ${temporaryToken}`;
    } else if (cookies) {
      // Fallback: Use session cookies (for logged-in users)
      console.log("[resume/parse] Using cookie-based authentication");
      headers["Cookie"] = cookies;
    } else {
      console.log(
        "[resume/parse] No authentication provided - proceeding anyway (backend may reject)"
      );
    }

    // Construct the correct Django backend URL with the candidate slug
    const backendUrl = `${API_ENDPOINTS.candidateProfiles.parseResume(
      candidateSlug
    )}`;
    console.log("[resume/parse] Calling backend URL:", backendUrl);

    // Forward the file to Django backend for parsing
    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers,
      credentials: "include",
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error(
        "[resume/parse] Backend error:",
        backendResponse.status,
        errorData
      );

      // Provide helpful error messages for common issues
      let errorMessage =
        errorData.detail || errorData.error || "Failed to parse resume";

      if (backendResponse.status === 401) {
        errorMessage = temporaryToken
          ? "Temporary token expired or invalid. Please restart signup."
          : "Authentication required for resume parsing.";
      } else if (backendResponse.status === 404) {
        errorMessage =
          "Resume parsing endpoint not available. Backend may not have this feature enabled.";
      }

      return NextResponse.json(
        {
          error: errorMessage,
          success: false,
          status: backendResponse.status,
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log("[resume/parse] Successfully parsed resume");

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("[resume/parse] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
