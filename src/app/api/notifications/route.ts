import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import { getUserNotifications, markAllNotificationsAsRead } from "@/features/notifications/notification.service";
import { ok } from "@/lib/http";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const notifications = await getUserNotifications(user.sub);
    return ok(notifications);
  });
}

export async function PATCH(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    await markAllNotificationsAsRead(user.sub);
    return ok({ success: true, message: "All notifications marked as read" });
  });
}
