import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/constants";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE, "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
  });
  return response;
}
