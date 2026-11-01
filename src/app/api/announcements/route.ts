import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import {
  listAnnouncements,
  createAnnouncement,
} from "@/features/announcements/announcement.service";
import { ok } from "@/lib/http";
import { RoleName } from "@prisma/client";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const targetRole = searchParams.get("targetRole") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const search = searchParams.get("search") || undefined;

    const announcements = await listAnnouncements({
      userRole: user.role,
      targetRole,
      priority,
      search,
      organizationId: user.organizationId,
      includeInactive:
        user.role === RoleName.SUPER_ADMIN || user.role === RoleName.ADMIN || user.role === RoleName.STAFF
          ? includeInactive
          : false,
    });

    return ok(announcements);
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.STAFF]);
    const body = await req.json();

    if (!body.title || !body.content) {
      throw new AppError("Title and content are required", 400);
    }

    const announcement = await createAnnouncement({
      title: body.title,
      content: body.content,
      targetRole: body.targetRole || "ALL",
      priority: body.priority || "NORMAL",
      authorId: user.sub,
      authorName:
        user.role === RoleName.SUPER_ADMIN || user.role === RoleName.ADMIN
          ? "Hospital Administration"
          : "Staff Desk",
      organizationId: user.organizationId,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });

    return ok(announcement, 201);
  });
}
