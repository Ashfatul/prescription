import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import {
  listTestReports,
  createTestReport,
} from "@/features/test-reports/test-report.service";
import { db } from "@/lib/db";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);

    let patientId = searchParams.get("patientId") || undefined;
    let doctorId = searchParams.get("doctorId") || undefined;

    if (user.role === "PATIENT") {
      const patient = await db.patient.findUnique({ where: { userId: user.sub } });
      if (patient) patientId = patient.id;
    }

    if (user.role === "DOCTOR") {
      const doc = await db.doctor.findUnique({ where: { userId: user.sub } });
      if (doc && !patientId) doctorId = doc.id;
    }

    const reports = await listTestReports({
      patientId,
      doctorId,
      organizationId: user.organizationId || undefined,
    });

    return ok(reports);
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const body = await req.json();

    let patientId = body.patientId;
    let doctorId = body.doctorId;

    if (user.role === "PATIENT") {
      const patient = await db.patient.findUnique({ where: { userId: user.sub } });
      if (!patient) throw new AppError("Patient profile not found", 400);
      patientId = patient.id;
    }

    if (user.role === "DOCTOR") {
      const doc = await db.doctor.findUnique({ where: { userId: user.sub } });
      if (doc) doctorId = doc.id;
    }

    if (!patientId) {
      throw new AppError("Patient is required for test report", 400);
    }

    if (!body.title || !body.fileUrl) {
      throw new AppError("Title and file are required", 400);
    }

    const report = await createTestReport({
      title: body.title,
      description: body.description,
      reportDate: body.reportDate ? new Date(body.reportDate) : new Date(),
      fileUrl: body.fileUrl,
      fileType: body.fileType || "application/pdf",
      originalName: body.originalName || "Diagnostic_Report.pdf",
      patientId,
      doctorId,
      prescriptionId: body.prescriptionId,
      uploadedById: user.sub,
      status: body.status,
      notes: body.notes,
      organizationId: user.organizationId,
    });

    return ok(report, 201);
  });
}
