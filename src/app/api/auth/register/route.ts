import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { createUser } from "@/features/users/user.service";
import { ok } from "@/lib/http";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { getAuthFromRequest } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const body = await req.json();
    const userCount = await db.user.count();

    if (userCount > 0) {
      const auth = await getAuthFromRequest(req);
      if (!auth || auth.role !== RoleName.SUPER_ADMIN) {
        throw new AppError("Only super admin can register new users", 403);
      }
    }

    const user = await createUser(body);
    return ok(user, 201);
  });
}
