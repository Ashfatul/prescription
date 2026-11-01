import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { deleteUser, getUserById, updateUser } from "@/features/users/user.service";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.STAFF]);
    const { id } = await context.params;
    return ok(await getUserById(id));
  });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);
    const { id } = await context.params;
    if (auth.role !== RoleName.SUPER_ADMIN && auth.sub !== id) {
      throw new AppError("Forbidden: cannot modify another user's profile", 403);
    }
    return ok(await updateUser(id, await req.json()));
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN]);
    const { id } = await context.params;
    return ok(await deleteUser(id));
  });
}
