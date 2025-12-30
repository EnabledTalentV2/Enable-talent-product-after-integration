import { NextResponse } from "next/server";
import type { UserData } from "@/lib/types/user";
import { setMockUserData } from "@/lib/mockUserSession";

export async function POST(request: Request) {
  const data = (await request.json()) as UserData;
  setMockUserData(data);
  setMockUserData(data);

  const response = NextResponse.json(data);
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
