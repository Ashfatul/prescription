import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { RoleName } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { wipeDatabaseForSetup } from "@/features/setup/setup.service";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    // 1. Strict Authorization: Only SUPER_ADMIN
    const sessionUser = await getCurrentUserFromCookie();
    if (!sessionUser || sessionUser.role.name !== RoleName.SUPER_ADMIN) {
      throw new AppError("Access denied. Super Administrator authorization required.", 403);
    }

    const body = await req.json();
    const password = body.password?.trim();
    const confirmationText = body.confirmationText?.trim();

    // 2. Validate confirmation phrase
    const REQUIRED_PHRASE = "WIPE EVERYTHING";
    if (confirmationText !== REQUIRED_PHRASE) {
      throw new AppError(
        `Confirmation phrase mismatch. Please type '${REQUIRED_PHRASE}' exactly to confirm.`,
        400
      );
    }

    // 3. Validate Administrator Password
    if (!password) {
      throw new AppError("Administrator password is required for security verification.", 400);
    }

    const dbUser = await db.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, passwordHash: true },
    });

    if (!dbUser || !(await bcrypt.compare(password, dbUser.passwordHash))) {
      throw new AppError("Incorrect administrator password. Factory reset aborted.", 401);
    }

    // 4. Execute the complete operational & settings wipe
    await wipeDatabaseForSetup();

    // 5. Build response and terminate session cookies
    const response = NextResponse.json({
      success: true,
      message: "System has been completely wiped and reset. Redirecting to setup...",
      redirectUrl: "/setup",
    });

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
