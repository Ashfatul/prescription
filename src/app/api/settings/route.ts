import { NextRequest } from "next/server";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { RoleName } from "@prisma/client";
import {
  getHospitalSettings,
  updateHospitalSettings,
} from "@/features/settings/settings.service";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const settings = await getHospitalSettings();
    return ok(settings);
  });
}

export async function PUT(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await getCurrentUserFromCookie();
    if (!user || user.role.name !== RoleName.SUPER_ADMIN) {
      throw new AppError("Super Admin access required", 403);
    }

    const body = await req.json();
    if (!body || typeof body !== "object") {
      throw new AppError("Invalid payload", 400);
    }

    const updated = await updateHospitalSettings(body);
    return ok(updated);
  });
}
