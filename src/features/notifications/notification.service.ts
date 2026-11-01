import { NotificationType, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { logActivity } from "@/features/activity-log/activity-log.service";

export type NotificationPreferences = {
  emailPrescriptionAlerts: boolean;
  systemPrescriptionAlerts: boolean;
  emailAppointmentReminders: boolean;
  systemAppointmentReminders: boolean;
  emailMedicineReminders: boolean;
  announcements: boolean;
};

export const defaultNotificationPreferences: NotificationPreferences = {
  emailPrescriptionAlerts: true,
  systemPrescriptionAlerts: true,
  emailAppointmentReminders: true,
  systemAppointmentReminders: true,
  emailMedicineReminders: true,
  announcements: true,
};

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}) {
  return db.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || NotificationType.SYSTEM,
      link: params.link,
    },
  });
}

export async function getUserNotifications(userId: string, limit = 30) {
  const [items, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    db.notification.count({
      where: { userId, read: false },
    }),
  ]);

  return { items, unreadCount };
}

export async function markNotificationAsRead(id: string, userId: string) {
  return db.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function getUserNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { notificationPreferences: true },
  });

  if (!user || !user.notificationPreferences) {
    return defaultNotificationPreferences;
  }

  try {
    const raw = typeof user.notificationPreferences === "string"
      ? JSON.parse(user.notificationPreferences)
      : user.notificationPreferences;
    return { ...defaultNotificationPreferences, ...raw };
  } catch {
    return defaultNotificationPreferences;
  }
}

export async function updateUserNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
) {
  const current = await getUserNotificationPreferences(userId);
  const updated = { ...current, ...preferences };

  await db.user.update({
    where: { id: userId },
    data: {
      notificationPreferences: updated as unknown as Prisma.InputJsonValue,
    },
  });

  return updated;
}

export async function sendPrescriptionAlert(params: {
  prescriptionId: string;
  patientUserId: string;
  doctorName: string;
  patientName: string;
  patientEmail?: string;
  organizationId?: string | null;
}) {
  const prefs = await getUserNotificationPreferences(params.patientUserId);

  // 1. In-App System Notification
  if (prefs.systemPrescriptionAlerts) {
    await createNotification({
      userId: params.patientUserId,
      title: "New Digital Prescription Issued",
      message: `${params.doctorName} has issued your prescription. You can view, download, or share it anytime.`,
      type: NotificationType.PRESCRIPTION_CREATED,
      link: `/prescriptions/${params.prescriptionId}/print`,
    });
  }

  // 2. Email Notification (Simulated & Logged)
  if (prefs.emailPrescriptionAlerts && params.patientEmail) {
    console.log(
      `[EMAIL DISPATCH] Sent prescription alert to ${params.patientEmail} for prescription #${params.prescriptionId}`
    );

    await logActivity({
      organizationId: params.organizationId,
      userId: params.patientUserId,
      userName: params.patientName,
      userRole: "PATIENT",
      action: "PRESCRIPTION_EMAIL_ALERT_SENT",
      entityType: "Prescription",
      entityId: params.prescriptionId,
      detailsJson: {
        to: params.patientEmail,
        doctor: params.doctorName,
        subject: `Your prescription from ${params.doctorName}`,
      },
    });
  }
}
