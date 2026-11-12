import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { withErrorHandling } from "@/lib/api-handler";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE, "", {
      path: "/",
      httpOnly: true,
      expires: new Date(0),
    });
    response.cookies.set("ppms_session", "", {
      path: "/",
      httpOnly: true,
      expires: new Date(0),
    });
    return response;
  });
}
