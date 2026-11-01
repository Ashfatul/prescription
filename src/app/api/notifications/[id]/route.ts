import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import { markNotificationAsRead } from "@/features/notifications/notification.service";
import { ok } from "@/lib/http";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const { id } = await context.params;
    await markNotificationAsRead(id, user.sub);
    return ok({ success: true });
  });
}
