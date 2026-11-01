import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type LogActivityParams = {
  organizationId?: string | null;
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  detailsJson?: Prisma.InputJsonValue;
  ipAddress?: string | null;
};

export async function logActivity(params: LogActivityParams) {
  try {
    return await db.activityLog.create({
      data: {
        organizationId: params.organizationId || null,
        userId: params.userId || null,
        userName: params.userName || "System",
        userRole: params.userRole || "SYSTEM",
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        detailsJson: params.detailsJson || Prisma.JsonNull,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    // Fail-safe: Activity logging shouldn't crash primary flows
    console.error("Failed to write activity log:", error);
    return null;
  }
}

export type ActivityLogFilter = {
  organizationId?: string;
  role?: string;
  action?: string;
  entityType?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export async function getActivityLogs(filters: ActivityLogFilter = {}) {
  const where: Prisma.ActivityLogWhereInput = {};

  if (filters.organizationId) {
    where.organizationId = filters.organizationId;
  }

  if (filters.role && filters.role !== "ALL") {
    where.userRole = filters.role;
  }

  if (filters.action && filters.action !== "ALL") {
    where.action = filters.action;
  }

  if (filters.entityType && filters.entityType !== "ALL") {
    where.entityType = filters.entityType;
  }

  if (filters.search) {
    where.OR = [
      { action: { contains: filters.search, mode: "insensitive" } },
      { userName: { contains: filters.search, mode: "insensitive" } },
      { entityType: { contains: filters.search, mode: "insensitive" } },
      { entityId: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    db.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filters.limit ?? 50,
      skip: filters.offset ?? 0,
      include: {
        organization: {
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    db.activityLog.count({ where }),
  ]);

  return { items, total };
}
