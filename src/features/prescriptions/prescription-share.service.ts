import crypto from "crypto";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { logActivity } from "@/features/activity-log/activity-log.service";

const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  imageUrl: true,
  signatureUrl: true,
};

export async function togglePrescriptionSharing(
  prescriptionId: string,
  enable?: boolean,
  baseUrl = ""
) {
  const existing = await db.prescription.findUnique({
    where: { id: prescriptionId },
    include: {
      doctor: { include: { user: { select: userSafeSelect } } },
      patient: { include: { user: { select: userSafeSelect } } },
    },
  });

  if (!existing) {
    throw new AppError("Prescription not found", 404);
  }

  const newState = enable !== undefined ? enable : !existing.isPublicShareEnabled;
  const shareToken = existing.shareToken || `rx-${crypto.randomBytes(8).toString("hex")}`;

  const updated = await db.prescription.update({
    where: { id: prescriptionId },
    data: {
      isPublicShareEnabled: newState,
      shareToken,
    },
    include: {
      doctor: { include: { user: { select: userSafeSelect } } },
      patient: { include: { user: { select: userSafeSelect } } },
      template: true,
    },
  });

  const domain = baseUrl.replace(/\/+$/, "");
  const shareUrl = `${domain}/p/${shareToken}`;

  let qrDataUrl = "";
  if (newState) {
    try {
      qrDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#0f766e",
          light: "#ffffff",
        },
      });
    } catch (err) {
      console.error("QR Code generation error:", err);
    }
  }

  await logActivity({
    organizationId: updated.organizationId,
    userId: updated.doctor?.userId,
    userName: updated.doctor?.user?.name || "Doctor",
    userRole: "DOCTOR",
    action: newState ? "PRESCRIPTION_SHARE_ENABLED" : "PRESCRIPTION_SHARE_DISABLED",
    entityType: "Prescription",
    entityId: updated.id,
    detailsJson: {
      shareToken,
      isPublicShareEnabled: newState,
      shareUrl,
    },
  });

  return {
    isPublicShareEnabled: updated.isPublicShareEnabled,
    shareToken: updated.shareToken,
    shareUrl,
    qrDataUrl,
  };
}

export async function sendPrescriptionShareEmail(params: {
  prescriptionId: string;
  recipientEmail: string;
  senderName: string;
  senderRole: string;
  senderUserId?: string;
  personalNote?: string;
  baseUrl?: string;
}) {
  const prescription = await db.prescription.findUnique({
    where: { id: params.prescriptionId },
    include: {
      doctor: { include: { user: { select: userSafeSelect } } },
      patient: { include: { user: { select: userSafeSelect } } },
    },
  });

  if (!prescription) {
    throw new AppError("Prescription not found", 404);
  }

  // Ensure public sharing is enabled so recipient can access it
  let token = prescription.shareToken;
  if (!prescription.isPublicShareEnabled || !token) {
    token = token || `rx-${crypto.randomBytes(8).toString("hex")}`;
    await db.prescription.update({
      where: { id: params.prescriptionId },
      data: { isPublicShareEnabled: true, shareToken: token },
    });
  }

  const domain = (params.baseUrl || "").replace(/\/+$/, "");
  const shareUrl = `${domain}/p/${token}`;

  console.log(
    `[EMAIL SENT] Prescription #${prescription.id} shared by ${params.senderName} with ${params.recipientEmail}. Public URL: ${shareUrl}`
  );

  await logActivity({
    organizationId: prescription.organizationId,
    userId: params.senderUserId,
    userName: params.senderName,
    userRole: params.senderRole,
    action: "PRESCRIPTION_SHARED_VIA_EMAIL",
    entityType: "Prescription",
    entityId: prescription.id,
    detailsJson: {
      recipientEmail: params.recipientEmail,
      shareUrl,
      personalNote: params.personalNote || null,
    },
  });

  return {
    success: true,
    recipientEmail: params.recipientEmail,
    shareUrl,
    message: `Prescription link sent successfully to ${params.recipientEmail}`,
  };
}

export async function getPrescriptionByShareToken(token: string) {
  const prescription = await db.prescription.findUnique({
    where: { shareToken: token },
    include: {
      doctor: { include: { user: { select: userSafeSelect } } },
      patient: { include: { user: { select: userSafeSelect } } },
      template: true,
      attachments: { include: { file: true } },
      organization: true,
      testReports: true,
    },
  });

  if (!prescription) {
    throw new AppError("Prescription not found or expired link", 404);
  }

  if (!prescription.isPublicShareEnabled) {
    throw new AppError("This prescription is currently private. The doctor or patient has disabled public link sharing.", 403);
  }

  return prescription;
}
