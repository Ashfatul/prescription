import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { updateUserPreferences } from "@/features/users/user.service";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);
    const user = await db.user.findUnique({
      where: { id: auth.sub },
      select: { id: true, theme: true, accent: true },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return ok(user);
  });
}

export async function PATCH(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);
    const body = await req.json();
    const updated = await updateUserPreferences(auth.sub, body);

    const response = NextResponse.json({
      success: true,
      data: updated,
    });

    if (updated.theme) {
      response.cookies.set("ppms_theme", updated.theme, {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    if (updated.accent) {
      response.cookies.set("ppms_accent", updated.accent, {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return response;
  });
}
