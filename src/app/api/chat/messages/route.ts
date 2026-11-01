import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import {
  listChatMessages,
  sendChatMessage,
} from "@/features/chat/chat.service";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get("connectionId");

    if (!connectionId) {
      throw new AppError("connectionId query param is required", 400);
    }

    const messages = await listChatMessages(connectionId, user.sub);
    return ok(messages);
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const body = await req.json();

    if (!body.connectionId || !body.message) {
      throw new AppError("connectionId and message are required", 400);
    }

    const message = await sendChatMessage({
      connectionId: body.connectionId,
      senderId: user.sub,
      message: body.message,
      attachmentUrl: body.attachmentUrl,
    });

    return ok(message, 201);
  });
}
