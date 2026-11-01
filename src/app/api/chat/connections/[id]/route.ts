import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import { respondChatConnection } from "@/features/chat/chat.service";
import { ChatStatus } from "@prisma/client";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const { id } = await context.params;
    const body = await req.json();

    if (!body.status || ![ChatStatus.APPROVED, ChatStatus.REJECTED].includes(body.status)) {
      throw new AppError("Invalid status. Must be APPROVED or REJECTED", 400);
    }

    const updated = await respondChatConnection({
      connectionId: id,
      userId: user.sub,
      status: body.status,
    });

    return ok(updated);
  });
}
