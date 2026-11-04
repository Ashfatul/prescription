import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";
import {
  getOrganizationDomain,
  updateOrganizationDomain,
  verifyOrganizationDomain,
} from "@/features/organizations/organization.service";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req, [RoleName.ADMIN, RoleName.SUPER_ADMIN]);
    const organizationId = auth.organizationId;
    if (!organizationId) throw new AppError("A clinic context is required.", 400);
    return ok(await getOrganizationDomain(organizationId));
  });
}

export async function PATCH(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req, [RoleName.ADMIN, RoleName.SUPER_ADMIN]);
    const organizationId = auth.organizationId;
    if (!organizationId) throw new AppError("A clinic context is required.", 400);
    const body = await req.json();
    return ok(await updateOrganizationDomain(organizationId, body.domain || null));
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req, [RoleName.ADMIN, RoleName.SUPER_ADMIN]);
    if (!auth.organizationId) throw new AppError("A clinic context is required.", 400);
    return ok(await verifyOrganizationDomain(auth.organizationId));
  });
}
