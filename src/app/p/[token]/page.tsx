import { Metadata } from "next";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { getPrescriptionByShareToken } from "@/features/prescriptions/prescription-share.service";
import {
  PublicPrescriptionView,
  PublicPrescriptionData,
} from "./public-prescription-view";

type Params = Promise<{ token: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { token } = await params;
  try {
    const rx = await getPrescriptionByShareToken(token);
    return {
      title: `Digital Prescription - ${rx.patient.user.name} | PPMS`,
      description: `Verified clinical digital prescription authored by ${rx.doctor.user.name}`,
    };
  } catch {
    return {
      title: "Prescription Access | PPMS",
    };
  }
}

export default async function PublicPrescriptionPage({ params }: { params: Params }) {
  const { token } = await params;
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const currentUrl = `${protocol}://${host}/p/${token}`;

  let prescription: PublicPrescriptionData | null = null;
  let errorMsg = "";

  try {
    prescription = (await getPrescriptionByShareToken(token)) as unknown as PublicPrescriptionData;
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "Prescription not available";
  }

  let qrDataUrl = "";
  if (prescription) {
    try {
      qrDataUrl = await QRCode.toDataURL(currentUrl, {
        width: 200,
        margin: 1,
        color: { dark: "#0f766e", light: "#ffffff" },
      });
    } catch (e) {
      console.error("QR Code generate error:", e);
    }
  }

  return (
    <PublicPrescriptionView
      prescription={prescription}
      qrDataUrl={qrDataUrl}
      errorMsg={errorMsg}
    />
  );
}
