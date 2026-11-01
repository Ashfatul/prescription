import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import {
  listChatConnections,
  requestChatConnection,
} from "@/features/chat/chat.service";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const connections = await listChatConnections(user.sub);
    return ok(connections);
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const body = await req.json();

    if (!body.recipientId) {
      throw new AppError("Recipient ID is required", 400);
    }

    const connection = await requestChatConnection({
      requesterId: user.sub,
      recipientId: body.recipientId,
      requestNote: body.requestNote,
      organizationId: user.organizationId,
    });

    return ok(connection, 201);
  });
}
