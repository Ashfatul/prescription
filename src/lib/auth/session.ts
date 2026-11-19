import { cache } from "react";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { verifyToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE } from "@/lib/auth/constants";

export function isRequestSecure(req: Request | NextRequest): boolean {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0].trim().toLowerCase() === "https";
  }
  return req.url.startsWith("https:");
}

export async function getAuthFromRequest(req: NextRequest) {
  const token =
    req.cookies.get(AUTH_COOKIE)?.value ||
    req.cookies.get("ppms_session")?.value;
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export const getCurrentUserFromCookie = cache(async () => {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get(AUTH_COOKIE)?.value ||
      cookieStore.get("ppms_session")?.value;
    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return null;
    }

    return await db.user.findUnique({
      where: { id: payload.sub },
      include: { role: true, doctor: true, patient: true, organization: true },
    });
  } catch {
    return null;
  }
});

export async function requireUser(req: NextRequest, allowedRoles?: RoleName[]) {
  const payload = await getAuthFromRequest(req);
  if (!payload) {
    throw new AppError("Unauthorized", 401);
  }

  if (allowedRoles && !allowedRoles.includes(payload.role)) {
    throw new AppError("Forbidden", 403);
  }

  return payload;
}
