import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { deleteUser, getUserById, updateUser } from "@/features/users/user.service";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.STAFF]);
    const { id } = await context.params;
    const targetUser = await getUserById(id);

    if (auth.role !== RoleName.SUPER_ADMIN && auth.organizationId) {
      if (targetUser.organizationId !== auth.organizationId) {
        throw new AppError("Forbidden: cannot view account from another clinic", 403);
      }
    }

    return ok(targetUser);
  });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);
    const { id } = await context.params;

    const isSuperAdmin = auth.role === RoleName.SUPER_ADMIN;
    const isSelf = auth.sub === id;

    if (!isSuperAdmin && !isSelf) {
      if (auth.role === RoleName.ADMIN && auth.organizationId) {
        const targetUser = await db.user.findUnique({ where: { id }, select: { organizationId: true } });
        if (!targetUser || targetUser.organizationId !== auth.organizationId) {
          throw new AppError("Forbidden: cannot modify users from another clinic", 403);
        }
      } else {
        throw new AppError("Forbidden: cannot modify another user's profile", 403);
      }
    }

    return ok(await updateUser(id, await req.json()));
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.ADMIN]);
    const { id } = await context.params;

    if (auth.role !== RoleName.SUPER_ADMIN && auth.organizationId) {
      const targetUser = await db.user.findUnique({
        where: { id },
        include: { role: true },
      });
      if (!targetUser || targetUser.organizationId !== auth.organizationId) {
        throw new AppError("Forbidden: cannot delete users from another clinic", 403);
      }
      if (targetUser.role.name === RoleName.SUPER_ADMIN) {
        throw new AppError("Forbidden: cannot delete super admin accounts", 403);
      }
    }

    return ok(await deleteUser(id));
  });
}
