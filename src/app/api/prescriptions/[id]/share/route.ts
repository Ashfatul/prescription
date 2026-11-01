import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import {
  togglePrescriptionSharing,
  sendPrescriptionShareEmail,
} from "@/features/prescriptions/prescription-share.service";
import { ok } from "@/lib/http";
import QRCode from "qrcode";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    await requireUser(req);
    const { id } = await context.params;

    const prescription = await db.prescription.findUnique({
      where: { id },
      select: {
        id: true,
        isPublicShareEnabled: true,
        shareToken: true,
      },
    });

    if (!prescription) {
      return ok({ isPublicShareEnabled: false, shareUrl: null, qrDataUrl: null });
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    let qrDataUrl = "";
    const shareUrl = prescription.shareToken
      ? `${baseUrl}/p/${prescription.shareToken}`
      : "";

    if (prescription.isPublicShareEnabled && shareUrl) {
      try {
        qrDataUrl = await QRCode.toDataURL(shareUrl, {
          width: 300,
          margin: 2,
          color: { dark: "#0f766e", light: "#ffffff" },
        });
      } catch (err) {
        console.error("QR generation error:", err);
      }
    }

    return ok({
      isPublicShareEnabled: prescription.isPublicShareEnabled,
      shareToken: prescription.shareToken,
      shareUrl,
      qrDataUrl,
    });
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    await requireUser(req);
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    const result = await togglePrescriptionSharing(id, body.enable, baseUrl);
    return ok(result);
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const { id } = await context.params;
    const body = await req.json();

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    const result = await sendPrescriptionShareEmail({
      prescriptionId: id,
      recipientEmail: body.recipientEmail,
      personalNote: body.personalNote,
      senderName: user.role,
      senderRole: user.role,
      senderUserId: user.sub,
      baseUrl,
    });

    return ok(result);
  });
}
