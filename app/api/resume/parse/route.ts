import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

/**
 * POST /api/resume/parse
 *
 * Uses cookie-based session authentication when available.
 *
 * The request can include:
 * - FormData with 'file' (the resume file)
 */
export async function POST(request: NextRequest) {
  try {
    const candidateSlug = request.headers.get("X-Candidate-Slug");
    const cookies = request.headers.get("cookie") || "";

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

    const backendFormData = new FormData();
    backendFormData.append("resume_file", file);
    backendFormData.append("accommodation_needs", "PREFER_TO_DISCUSS_LATER");

    const uploadResponse = await backendFetch(
      API_ENDPOINTS.candidateProfiles.detail(candidateSlug),
      {
        method: "PATCH",
        body: backendFormData,
      },
      cookies
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      console.error(
        "[resume/parse] Upload error:",
        uploadResponse.status,
        errorData
      );

      // Provide helpful error messages for common issues
      let errorMessage =
        errorData.detail || errorData.error || "Failed to parse resume";

      if (uploadResponse.status === 401) {
        errorMessage = "Authentication required for resume parsing.";
      } else if (uploadResponse.status === 404) {
        errorMessage =
          "Resume parsing endpoint not available. Backend may not have this feature enabled.";
      }

      return NextResponse.json(
        {
          error: errorMessage,
          success: false,
          status: uploadResponse.status,
        },
        { status: uploadResponse.status }
      );
    }

    const parseResponse = await backendFetch(
      API_ENDPOINTS.candidateProfiles.parseResume(candidateSlug),
      {
        method: "POST",
      },
      cookies
    );

    const data = await parseResponse.json().catch(() => ({}));

    return NextResponse.json(
      {
        success: parseResponse.ok,
        data,
      },
      { status: parseResponse.status }
    );
  } catch (error) {
    console.error("[resume/parse] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
