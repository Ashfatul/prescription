import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import {
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
} from "@/features/notifications/notification.service";
import { ok } from "@/lib/http";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const prefs = await getUserNotificationPreferences(user.sub);
    return ok(prefs);
  });
}

export async function PUT(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const body = await req.json();
    const updated = await updateUserNotificationPreferences(user.sub, body);
    return ok(updated);
  });
}
