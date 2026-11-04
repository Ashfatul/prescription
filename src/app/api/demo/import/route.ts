import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { getAuthFromRequest } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { isDemoModeActive, seedOrResetDemoClinic } from "@/features/demo/demo-reset.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    if (!isDemoModeActive()) {
      throw new AppError("Demo import is only available when Demo Mode is enabled.", 403);
    }

    const auth = await getAuthFromRequest(req);
    if (!auth) throw new AppError("Authentication is required.", 401);

    const actor = await db.user.findUnique({
      where: { id: auth.sub },
      include: { role: true },
    });
    if (!actor || actor.role.name !== RoleName.SUPER_ADMIN) {
      throw new AppError("Only a Super Admin can import demo data.", 403);
    }

    const clinic = await seedOrResetDemoClinic(db, { seedSampleData: true });
    return ok({
      success: true,
      clinicId: clinic.id,
      clinicSlug: clinic.slug,
      message: "Demo clinic data imported successfully.",
    });
  });
}