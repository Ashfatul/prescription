import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { NotificationType, Prisma, TestReportStatus } from "@prisma/client";
import { logActivity } from "@/features/activity-log/activity-log.service";
import { createNotification } from "@/features/notifications/notification.service";

export type CreateTestReportParams = {
  title: string;
  description?: string;
  reportDate?: Date;
  fileUrl: string;
  fileType?: string;
  originalName: string;
  patientId: string;
  doctorId?: string;
  prescriptionId?: string;
  uploadedById: string;
  status?: TestReportStatus;
  notes?: string;
  organizationId?: string | null;
};

export async function listTestReports(filter: {
  patientId?: string;
  doctorId?: string;
  organizationId?: string;
}) {
  const where: Prisma.TestReportWhereInput = {};

  if (filter.patientId) {
    where.patientId = filter.patientId;
  }

  if (filter.doctorId) {
    where.doctorId = filter.doctorId;
  }

  if (filter.organizationId) {
    where.organizationId = filter.organizationId;
  }

  return db.testReport.findMany({
    where,
    include: {
      patient: { include: { user: true } },
      doctor: { include: { user: true } },
      uploadedBy: { select: { id: true, name: true, role: true } },
      prescription: { select: { id: true, createdAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTestReport(params: CreateTestReportParams) {
  const patient = await db.patient.findUnique({
    where: { id: params.patientId },
    include: { user: true },
  });

  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  const uploader = await db.user.findUnique({
    where: { id: params.uploadedById },
    include: { role: true },
  });

  const report = await db.testReport.create({
    data: {
      title: params.title,
      description: params.description,
      reportDate: params.reportDate || new Date(),
      fileUrl: params.fileUrl,
      fileType: params.fileType || "application/pdf",
      originalName: params.originalName,
      patientId: params.patientId,
      doctorId: params.doctorId,
      prescriptionId: params.prescriptionId,
      uploadedById: params.uploadedById,
      status: params.status || TestReportStatus.PENDING,
      notes: params.notes,
      organizationId: params.organizationId,
    },
    include: {
      patient: { include: { user: true } },
      doctor: { include: { user: true } },
      uploadedBy: true,
    },
  });

  // Log activity
  await logActivity({
    organizationId: params.organizationId,
    userId: params.uploadedById,
    userName: uploader?.name || "User",
    userRole: uploader?.role?.name || "USER",
    action: "TEST_REPORT_UPLOADED",
    entityType: "TestReport",
    entityId: report.id,
    detailsJson: {
      title: report.title,
      patient: patient.user.name,
      fileType: report.fileType,
    },
  });

  // Notification: if patient uploaded, alert doctor (if attached)
  if (params.doctorId && uploader?.role?.name === "PATIENT") {
    const doc = await db.doctor.findUnique({
      where: { id: params.doctorId },
      include: { user: true },
    });
    if (doc) {
      await createNotification({
        userId: doc.userId,
        title: "Patient Uploaded Diagnostic Test Report",
        message: `${patient.user.name} uploaded test report "${report.title}" for your clinical review.`,
        type: NotificationType.TEST_REPORT_ADDED,
      });
    }
  }

  // If doctor uploaded, alert patient
  if (uploader?.role?.name === "DOCTOR") {
    await createNotification({
      userId: patient.userId,
      title: "Doctor Added Diagnostic Test Report",
      message: `${uploader.name} added diagnostic report "${report.title}" to your health profile.`,
      type: NotificationType.TEST_REPORT_ADDED,
    });
  }

  return report;
}

export async function updateTestReport(
  id: string,
  data: {
    status?: TestReportStatus;
    notes?: string;
    title?: string;
    description?: string;
  }
) {
  const existing = await db.testReport.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Test report not found", 404);
  }

  return db.testReport.update({
    where: { id },
    data: {
      status: data.status !== undefined ? data.status : existing.status,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      title: data.title !== undefined ? data.title : existing.title,
      description: data.description !== undefined ? data.description : existing.description,
    },
    include: {
      patient: { include: { user: true } },
      doctor: { include: { user: true } },
    },
  });
}

export async function deleteTestReport(id: string) {
  const existing = await db.testReport.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Test report not found", 404);
  }

  return db.testReport.delete({ where: { id } });
}
