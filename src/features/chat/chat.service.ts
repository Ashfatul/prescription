import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { ChatStatus, NotificationType } from "@prisma/client";
import { logActivity } from "@/features/activity-log/activity-log.service";
import { createNotification } from "@/features/notifications/notification.service";

export async function listChatConnections(userId: string) {
  const connections = await db.chatConnection.findMany({
    where: {
      OR: [{ requesterId: userId }, { recipientId: userId }],
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
          role: true,
          doctor: { select: { specialization: true } },
          patient: { select: { gender: true } },
        },
      },
      recipient: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
          role: true,
          doctor: { select: { specialization: true } },
          patient: { select: { gender: true } },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return connections.map((conn) => {
    const isRequester = conn.requesterId === userId;
    const partner = isRequester ? conn.recipient : conn.requester;
    const lastMessage = conn.messages[0] || null;

    return {
      id: conn.id,
      status: conn.status,
      requestNote: conn.requestNote,
      createdAt: conn.createdAt,
      updatedAt: conn.updatedAt,
      isRequester,
      partner,
      lastMessage,
    };
  });
}

export async function requestChatConnection(params: {
  requesterId: string;
  recipientId: string;
  requestNote?: string;
  organizationId?: string | null;
}) {
  if (params.requesterId === params.recipientId) {
    throw new AppError("Cannot initiate chat with yourself", 400);
  }

  // Check if either direction exists
  const existing = await db.chatConnection.findFirst({
    where: {
      OR: [
        { requesterId: params.requesterId, recipientId: params.recipientId },
        { requesterId: params.recipientId, recipientId: params.requesterId },
      ],
    },
  });

  if (existing) {
    if (existing.status === ChatStatus.APPROVED) {
      return existing;
    }
    if (existing.status === ChatStatus.PENDING) {
      return existing;
    }
    // If was rejected, allow re-requesting by updating status to PENDING
    return db.chatConnection.update({
      where: { id: existing.id },
      data: {
        requesterId: params.requesterId,
        recipientId: params.recipientId,
        status: ChatStatus.PENDING,
        requestNote: params.requestNote,
      },
    });
  }

  const requester = await db.user.findUnique({
    where: { id: params.requesterId },
    include: { role: true },
  });

  const connection = await db.chatConnection.create({
    data: {
      requesterId: params.requesterId,
      recipientId: params.recipientId,
      status: ChatStatus.PENDING,
      requestNote: params.requestNote,
      organizationId: params.organizationId,
    },
  });

  // Notify recipient about the request
  await createNotification({
    userId: params.recipientId,
    title: "New Chat Consultation Request",
    message: `${requester?.name || "A user"} (${requester?.role?.name || "User"}) requested to connect for clinical chat. Approval required before messages can be exchanged.`,
    type: NotificationType.CHAT_REQUEST,
  });

  await logActivity({
    organizationId: params.organizationId,
    userId: params.requesterId,
    userName: requester?.name || "User",
    userRole: requester?.role?.name || "USER",
    action: "CHAT_CONNECTION_REQUESTED",
    entityType: "ChatConnection",
    entityId: connection.id,
    detailsJson: {
      recipientId: params.recipientId,
      note: params.requestNote || null,
    },
  });

  return connection;
}

export async function respondChatConnection(params: {
  connectionId: string;
  userId: string;
  status: ChatStatus;
}) {
  const connection = await db.chatConnection.findUnique({
    where: { id: params.connectionId },
    include: {
      recipient: { include: { role: true } },
      requester: { include: { role: true } },
    },
  });

  if (!connection) {
    throw new AppError("Chat connection not found", 404);
  }

  // Only recipient can approve or reject
  if (connection.recipientId !== params.userId) {
    throw new AppError("Only the recipient can approve or decline this chat request", 403);
  }

  const updated = await db.chatConnection.update({
    where: { id: params.connectionId },
    data: { status: params.status },
  });

  // Notify requester of decision
  await createNotification({
    userId: connection.requesterId,
    title: `Chat Request ${params.status}`,
    message: `${connection.recipient.name} has ${params.status.toLowerCase()} your chat consultation request.`,
    type: NotificationType.CHAT_REQUEST,
  });

  await logActivity({
    organizationId: connection.organizationId,
    userId: params.userId,
    userName: connection.recipient.name,
    userRole: connection.recipient.role.name,
    action: `CHAT_CONNECTION_${params.status}`,
    entityType: "ChatConnection",
    entityId: connection.id,
    detailsJson: { requesterId: connection.requesterId },
  });

  return updated;
}

export async function listChatMessages(connectionId: string, userId: string) {
  const connection = await db.chatConnection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    throw new AppError("Chat thread not found", 404);
  }

  if (connection.requesterId !== userId && connection.recipientId !== userId) {
    throw new AppError("Forbidden", 403);
  }

  if (connection.status !== ChatStatus.APPROVED) {
    throw new AppError("Chat thread has not been approved yet", 400);
  }

  // Mark unread messages from other user as read
  await db.chatMessage.updateMany({
    where: {
      chatConnectionId: connectionId,
      senderId: { not: userId },
      read: false,
    },
    data: { read: true },
  });

  return db.chatMessage.findMany({
    where: { chatConnectionId: connectionId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: { id: true, name: true, role: true, imageUrl: true },
      },
    },
  });
}

export async function sendChatMessage(params: {
  connectionId: string;
  senderId: string;
  message: string;
  attachmentUrl?: string;
}) {
  const connection = await db.chatConnection.findUnique({
    where: { id: params.connectionId },
    include: { requester: true, recipient: true },
  });

  if (!connection) {
    throw new AppError("Chat thread not found", 404);
  }

  if (connection.requesterId !== params.senderId && connection.recipientId !== params.senderId) {
    throw new AppError("Forbidden", 403);
  }

  if (connection.status !== ChatStatus.APPROVED) {
    throw new AppError("Cannot send message: Chat request has not been approved.", 400);
  }

  const message = await db.chatMessage.create({
    data: {
      chatConnectionId: params.connectionId,
      senderId: params.senderId,
      message: params.message.trim(),
      attachmentUrl: params.attachmentUrl,
    },
    include: {
      sender: {
        select: { id: true, name: true, role: true, imageUrl: true },
      },
    },
  });

  // Touch connection updatedAt
  await db.chatConnection.update({
    where: { id: params.connectionId },
    data: { updatedAt: new Date() },
  });

  const recipientId =
    connection.requesterId === params.senderId
      ? connection.recipientId
      : connection.requesterId;

  const senderUser =
    connection.requesterId === params.senderId
      ? connection.requester
      : connection.recipient;

  // Notify recipient of new message
  await createNotification({
    userId: recipientId,
    title: `New message from ${senderUser.name}`,
    message: params.message.slice(0, 100),
    type: NotificationType.CHAT_MESSAGE,
  });

  return message;
}
