import { NextRequest, NextResponse } from "next/server";
import { initialUserData } from "@/lib/userDataDefaults";
import { getMockUserData } from "@/lib/mockUserSession";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = getMockUserData() ?? initialUserData;

  return NextResponse.json(data);
}
