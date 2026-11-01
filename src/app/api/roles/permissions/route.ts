import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ok } from "@/lib/http";
import {
  AVAILABLE_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_CATEGORIES,
} from "@/lib/auth/permissions";
import { z } from "zod";

const updateRolePermissionsSchema = z.object({
  role: z.enum(RoleName).optional(),
  permissions: z.array(z.string()).optional(),
  batch: z.record(z.enum(RoleName), z.array(z.string())).optional(),
});

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.STAFF]);

    // Ensure all 4 standard roles exist in DB
    const existingRoles = await db.role.findMany({
      orderBy: { name: "asc" },
    });

    const rolesMap: Record<string, string[]> = {};

    for (const r of existingRoles) {
      let perms = r.permissions as string[] | null;
      if (!perms || !Array.isArray(perms) || perms.length === 0) {
        perms = DEFAULT_ROLE_PERMISSIONS[r.name] || [];
        // Save defaults if empty
        await db.role.update({
          where: { id: r.id },
          data: { permissions: perms },
        });
      }
      rolesMap[r.name] = perms;
    }

    return ok({
      categories: PERMISSION_CATEGORIES,
      availablePermissions: AVAILABLE_PERMISSIONS,
      roles: rolesMap,
    });
  });
}

export async function PATCH(req: NextRequest) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.ADMIN]);
    const body = updateRolePermissionsSchema.parse(await req.json());

    if (body.batch) {
      // Update multiple roles at once
      for (const [roleName, perms] of Object.entries(body.batch)) {
        await db.role.updateMany({
          where: { name: roleName as RoleName },
          data: { permissions: perms },
        });
      }
    } else if (body.role && body.permissions) {
      // Update single role
      await db.role.updateMany({
        where: { name: body.role },
        data: { permissions: body.permissions },
      });
    }

    // Return updated roles
    const updatedRoles = await db.role.findMany({ orderBy: { name: "asc" } });
    const rolesMap: Record<string, string[]> = {};
    for (const r of updatedRoles) {
      rolesMap[r.name] = (r.permissions as string[]) || [];
    }

    return ok({
      roles: rolesMap,
    });
  });
}
