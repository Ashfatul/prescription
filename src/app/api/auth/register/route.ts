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

    const isPatientRegistration = body.role === RoleName.PATIENT;

    // First user can be registered as SUPER_ADMIN without restrictions
    if (userCount > 0 && !isPatientRegistration) {
      const auth = await getAuthFromRequest(req);
      if (!auth || (auth.role !== RoleName.SUPER_ADMIN && auth.role !== RoleName.STAFF)) {
        throw new AppError("Only super admin or staff can register doctors and staff accounts", 403);
      }
    }

    const auth = await getAuthFromRequest(req);
    const user = await createUser(body, auth?.sub);
    return ok(user, 201);
  });
}
