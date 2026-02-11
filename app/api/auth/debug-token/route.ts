import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { decodeJwt, decodeProtectedHeader } from "jose";

// Temporary route for manual backend testing.
// Disabled in production unless explicitly enabled.
const isRouteEnabled = () => {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ENABLE_DEBUG_TOKEN_ROUTE === "true";
};

export async function GET(request: NextRequest) {
  if (!isRouteEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const templateFromQuery = url.searchParams.get("template");
  const templateFromEnv = (process.env.CLERK_JWT_TEMPLATE || "").trim();
  const template = (templateFromQuery || templateFromEnv || "api").trim() || "api";

  const token = await getToken({ template });

  if (!token) {
    return NextResponse.json(
      { error: "Unable to issue Clerk token for this session." },
      { status: 401 }
    );
  }

  // TEMP DEBUG (remove before production):
  // Log token + decoded claims so you can copy/paste into backend tests quickly.
  // Never log full JWTs in production logs.
  if (process.env.NODE_ENV !== "production") {
    let header: Record<string, unknown> | null = null;
    let payload: Record<string, unknown> | null = null;
    try {
      header = decodeProtectedHeader(token) as unknown as Record<string, unknown>;
      payload = decodeJwt(token) as unknown as Record<string, unknown>;
    } catch (err) {
      console.error("[auth/debug-token] Failed to decode JWT:", err);
    }

    const fmtEST = (sec: unknown) => {
      if (typeof sec !== "number") return null;
      return new Date(sec * 1000).toLocaleString("en-US", {
        timeZone: "America/New_York",
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      });
    };

    const exp = payload?.exp;
    const iat = payload?.iat;
    const nbf = payload?.nbf;
    const ttlSeconds =
      typeof exp === "number" && typeof iat === "number" ? exp - iat : null;

    console.log("[auth/debug-token] Issued Clerk JWT", {
      userId,
      template,
      token,
    });
    console.log("[auth/debug-token] Decoded Clerk JWT (TEMP DEBUG)", {
      header,
      payload,
      est: {
        nbf: fmtEST(nbf),
        iat: fmtEST(iat),
        exp: fmtEST(exp),
      },
      ttlSeconds,
    });
  }

  return NextResponse.json(
    {
      userId,
      tokenType: "Bearer",
      template,
      token,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
      },
    }
  );
}
