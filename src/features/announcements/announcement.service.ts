import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { Prisma } from "@prisma/client";
import { logActivity } from "@/features/activity-log/activity-log.service";

export type CreateAnnouncementParams = {
  title: string;
  content: string;
  targetRole?: string; // "ALL" | "DOCTOR" | "PATIENT" | "STAFF"
  priority?: string; // "NORMAL" | "HIGH" | "URGENT"
  authorId: string;
  authorName: string;
  organizationId?: string | null;
  expiresAt?: Date;
};

export type ListAnnouncementsOptions = {
  userRole?: string;
  targetRole?: string;
  priority?: string;
  search?: string;
  organizationId?: string | null;
  includeInactive?: boolean;
};

export async function listAnnouncements(options: ListAnnouncementsOptions = {}) {
  const andConditions: Prisma.AnnouncementWhereInput[] = [];

  if (!options.includeInactive) {
    andConditions.push({ isActive: true });
  }

  // 1. Organization boundary (Hospital tenant isolation or global announcements)
  if (options.organizationId) {
    andConditions.push({
      OR: [
        { organizationId: null },
        { organizationId: options.organizationId },
      ],
    });
  }

  // 2. Role permission boundary (What this user's role is allowed to view)
  if (options.userRole && options.userRole !== "SUPER_ADMIN") {
    andConditions.push({
      OR: [
        { targetRole: "ALL" },
        { targetRole: options.userRole },
      ],
    });
  }

  // 3. User-selected target role filter
  if (options.targetRole && options.targetRole !== "ALL") {
    andConditions.push({ targetRole: options.targetRole });
  }

  // 4. User-selected priority filter
  if (options.priority && options.priority !== "ALL") {
    andConditions.push({ priority: options.priority });
  }

  // 5. Search query (matches title or content)
  if (options.search && options.search.trim()) {
    const q = options.search.trim();
    andConditions.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { authorName: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.AnnouncementWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  return db.announcement.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function createAnnouncement(params: CreateAnnouncementParams) {
  const announcement = await db.announcement.create({
    data: {
      title: params.title,
      content: params.content,
      targetRole: params.targetRole || "ALL",
      priority: params.priority || "NORMAL",
      authorId: params.authorId,
      authorName: params.authorName,
      organizationId: params.organizationId,
      expiresAt: params.expiresAt,
      isActive: true,
    },
  });

  await logActivity({
    organizationId: params.organizationId,
    userId: params.authorId,
    userName: params.authorName,
    userRole: "SUPER_ADMIN",
    action: "ANNOUNCEMENT_CREATED",
    entityType: "Announcement",
    entityId: announcement.id,
    detailsJson: {
      title: announcement.title,
      targetRole: announcement.targetRole,
      priority: announcement.priority,
    },
  });

  return announcement;
}

export async function updateAnnouncement(
  id: string,
  data: {
    title?: string;
    content?: string;
    targetRole?: string;
    priority?: string;
    isActive?: boolean;
  }
) {
  const existing = await db.announcement.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Announcement not found", 404);
  }

  return db.announcement.update({
    where: { id },
    data,
  });
}

export async function deleteAnnouncement(id: string) {
  const existing = await db.announcement.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Announcement not found", 404);
  }

  return db.announcement.delete({ where: { id } });
}
