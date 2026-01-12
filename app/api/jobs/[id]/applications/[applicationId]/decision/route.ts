import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, backendFetch } from "@/lib/api-config";

type RouteContext = {
  params: Promise<{ id: string; applicationId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const { id: jobId, applicationId } = await context.params;
    const body = await request.json();

    console.log(
      "[Application Decision API] Request for job:",
      jobId,
      "application:",
      applicationId,
      "body:",
      body
    );
    console.log(
      "[Application Decision API] Backend URL:",
      API_ENDPOINTS.jobs.applicationDecision(jobId, applicationId)
    );

    const backendResponse = await backendFetch(
      API_ENDPOINTS.jobs.applicationDecision(jobId, applicationId),
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      cookies
    );

    console.log(
      "[Application Decision API] Backend response status:",
      backendResponse.status
    );

    // If backend returns an error status, try to get text for debugging
    if (!backendResponse.ok) {
      const text = await backendResponse.text();
      console.error(
        "[Application Decision API] Backend error response (full):",
        text
      );

      return NextResponse.json(
        {
          error: "Backend returned an error",
          status: backendResponse.status,
          message: "Failed to update candidate decision",
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json().catch((err) => {
      console.error(
        "[Application Decision API] Failed to parse response:",
        err
      );
      return {
        message: "Decision updated but response format unexpected",
        status: body.status,
        application_id: applicationId,
        job_id: jobId,
      };
    });

    console.log("[Application Decision API] Backend response data:", data);

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("[Application Decision API] Error:", error);
    return NextResponse.json(
      { error: "Failed to update candidate decision" },
      { status: 500 }
    );
  }
}
