import { NextResponse } from "next/server";
import { clearMockUserData } from "@/lib/mockUserSession";

export async function POST() {
  clearMockUserData();

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return response;
}
