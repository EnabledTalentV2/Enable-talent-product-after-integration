import { NextResponse } from "next/server";
import { initialUserData } from "@/lib/userDataDefaults";
import { setMockUserData } from "@/lib/mockUserSession";

export async function POST(request: Request) {
  try {
    await request.json();
  } catch {
    // Ignore malformed or empty payload for the dummy endpoint.
  }

  setMockUserData(initialUserData);

  const response = NextResponse.json(initialUserData);
  response.cookies.set({
    name: "token",
    value: "dummy-jwt-token",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60,
    path: "/",
  });

  return response;
}
