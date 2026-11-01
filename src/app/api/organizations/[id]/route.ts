import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import {
  getOrganizationById,
  updateOrganization,
} from "@/features/organizations/organization.service";
import { RoleName } from "@prisma/client";
import { ok } from "@/lib/http";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    await requireUser(req);
    const { id } = await context.params;
    const org = await getOrganizationById(id);
    return ok(org);
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN]);
    const { id } = await context.params;
    const body = await req.json();

    const updated = await updateOrganization(id, body);
    return ok(updated);
  });
}
