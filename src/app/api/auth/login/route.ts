import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const body = loginSchema.parse(await req.json());

    const user = await db.user.findUnique({
      where: { email: body.email },
      include: { role: true },
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
    });

    const res = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });

    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  });
}
