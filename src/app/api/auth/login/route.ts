import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { logActivity } from "@/features/activity-log/activity-log.service";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const body = loginSchema.parse(await req.json());

    const user = await db.user.findUnique({
      where: { email: body.email },
      include: { role: true, organization: true },
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = await signToken({
      sub: user.id,
      role: user.role.name,
      organizationId: user.organizationId,
    });

    // Log login activity
    await logActivity({
      organizationId: user.organizationId,
      userId: user.id,
      userName: user.name,
      userRole: user.role.name,
      action: "USER_LOGIN",
      entityType: "User",
      entityId: user.id,
      detailsJson: { email: user.email },
    });

    const res = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        organizationId: user.organizationId,
        organizationName: user.organization?.name || null,
        theme: user.theme || "system",
        accent: user.accent || "teal",
      },
    });

    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    res.cookies.set("ppms_theme", user.theme || "system", {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });

    res.cookies.set("ppms_accent", user.accent || "teal", {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });

    return res;
  });
}
