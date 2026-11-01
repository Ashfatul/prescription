import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import {
  updateAnnouncement,
  deleteAnnouncement,
} from "@/features/announcements/announcement.service";
import { RoleName } from "@prisma/client";
import { ok } from "@/lib/http";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.STAFF]);
    const { id } = await context.params;
    const body = await req.json();

    const updated = await updateAnnouncement(id, body);
    return ok(updated);
  });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.STAFF]);
    const { id } = await context.params;

    await deleteAnnouncement(id);
    return ok({ success: true });
  });
}
