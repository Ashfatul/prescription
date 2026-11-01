import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { getAuthFromRequest } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await getAuthFromRequest(req);
    if (!auth) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await db.user.findUnique({
      where: { id: auth.sub },
      include: { role: true, doctor: true, patient: true },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Exclude sensitive password hash
    const safeUser = { ...user };
    delete (safeUser as { passwordHash?: string }).passwordHash;
    return ok(safeUser);
  });
}
