import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { verifyToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE } from "@/lib/auth/constants";

export async function getAuthFromRequest(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export async function getCurrentUserFromCookie() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  return db.user.findUnique({
    where: { id: payload.sub },
    include: { role: true, doctor: true, patient: true },
  });
}

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
