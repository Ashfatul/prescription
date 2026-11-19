import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";
import {
  ALL_ROLES,
  AVAILABLE_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_CATEGORIES,
  SUBORDINATE_ROLES,
  canManageRole,
  isSuperAdminPermission,
} from "@/lib/auth/permissions";
import { logActivity } from "@/features/activity-log/activity-log.service";
import { z } from "zod";

const updateRolePermissionsSchema = z.object({
  role: z.enum(RoleName).optional(),
  permissions: z.array(z.string()).optional(),
  batch: z.record(z.enum(RoleName), z.array(z.string())).optional(),
});

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const authUser = await requireUser(req, [
      RoleName.SUPER_ADMIN,
      RoleName.ADMIN,
      RoleName.STAFF,
    ]);
    const isSuperAdmin = authUser.role === RoleName.SUPER_ADMIN;

    // Ensure all 5 system roles exist in DB
    const existingRoles = await db.role.findMany({
      orderBy: { name: "asc" },
    });

    const rolesMap: Record<string, string[]> = {};

    for (const r of existingRoles) {
      let perms = r.permissions as string[] | null;
      let needsSave = false;

      if (!perms || !Array.isArray(perms) || perms.length === 0) {
        perms = DEFAULT_ROLE_PERMISSIONS[r.name] || [];
        needsSave = true;
      }

      // Sanitize Clinic Admin (ADMIN) to remove any accidental or legacy Super Admin permissions
      if (r.name === RoleName.ADMIN && perms && Array.isArray(perms)) {
        const sanitized = perms.filter((p) => !isSuperAdminPermission(p));
        if (sanitized.length !== perms.length) {
          perms = sanitized;
          needsSave = true;
        }
      }

      // Ensure Super Admin always holds all available permissions
      if (r.name === RoleName.SUPER_ADMIN && perms && Array.isArray(perms)) {
        const allIds = AVAILABLE_PERMISSIONS.map((p) => p.id);
        const missing = allIds.filter((id) => !perms!.includes(id));
        if (missing.length > 0) {
          perms = allIds;
          needsSave = true;
        }
      }

      if (needsSave) {
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
      userRole: authUser.role,
      canManageRoles: isSuperAdmin ? ALL_ROLES : SUBORDINATE_ROLES,
      isSuperAdmin,
    });
  });
}

export async function PATCH(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const authUser = await requireUser(req, [
      RoleName.SUPER_ADMIN,
      RoleName.ADMIN,
    ]);
    const isSuperAdmin = authUser.role === RoleName.SUPER_ADMIN;
    const body = updateRolePermissionsSchema.parse(await req.json());

    // Security Gate for Clinic Admin:
    // Clinic administrators can only manage permissions for subordinate roles (DOCTOR, STAFF, PATIENT).
    // They MUST NEVER configure permissions for SUPER_ADMIN or ADMIN.
    if (!isSuperAdmin) {
      if (body.role && !canManageRole(authUser.role, body.role)) {
        throw new AppError(
          "Forbidden: Clinic administrators can only manage permissions for subordinate roles (Doctor, Staff, Patient).",
          403
        );
      }

      if (body.batch) {
        for (const roleKey of Object.keys(body.batch)) {
          if (!canManageRole(authUser.role, roleKey as RoleName)) {
            throw new AppError(
              `Forbidden: Clinic administrators cannot configure permissions for role '${roleKey}'.`,
              403
            );
          }
        }
      }

      // Clinic Admin cannot assign Super Admin restricted permissions to anyone
      const checkPermissions = (permList: string[]) => {
        const forbidden = permList.filter((p) => isSuperAdminPermission(p));
        if (forbidden.length > 0) {
          throw new AppError(
            `Forbidden: Clinic administrators cannot assign platform Super Admin privileges (${forbidden.join(", ")}).`,
            403
          );
        }
      };

      if (body.permissions) checkPermissions(body.permissions);
      if (body.batch) {
        for (const permList of Object.values(body.batch)) {
          checkPermissions(permList);
        }
      }
    }

    const updatedRoleNames: string[] = [];

    if (body.batch) {
      for (const [roleName, perms] of Object.entries(body.batch)) {
        await db.role.updateMany({
          where: { name: roleName as RoleName },
          data: { permissions: perms },
        });
        updatedRoleNames.push(roleName);
      }
    } else if (body.role && body.permissions) {
      await db.role.updateMany({
        where: { name: body.role },
        data: { permissions: body.permissions },
      });
      updatedRoleNames.push(body.role);
    }

    // Log security audit trail
    await logActivity({
      organizationId: authUser.organizationId,
      userId: authUser.sub,
      userName: `User (${authUser.sub})`,
      userRole: authUser.role,
      action: "ROLE_PERMISSIONS_UPDATED",
      entityType: "ROLE_PERMISSIONS",
      detailsJson: {
        updatedRoles: updatedRoleNames,
        actorRole: authUser.role,
        isSuperAdmin,
      },
    });

    // Return updated roles
    const updatedRoles = await db.role.findMany({ orderBy: { name: "asc" } });
    const rolesMap: Record<string, string[]> = {};
    for (const r of updatedRoles) {
      rolesMap[r.name] = (r.permissions as string[]) || [];
    }

    return ok({
      roles: rolesMap,
      canManageRoles: isSuperAdmin ? ALL_ROLES : SUBORDINATE_ROLES,
    });
  });
}
