import crypto from "crypto";
import { Prisma, RoleName, AppointmentStatus } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import {
  prescriptionSchema,
  prescriptionUpdateSchema,
} from "@/features/prescriptions/prescription.schema";
import { sendPrescriptionAlert } from "@/features/notifications/notification.service";
import { logActivity } from "@/features/activity-log/activity-log.service";
import { generateRemindersFromPrescription } from "@/features/medicine-reminders/medicine-reminder.service";

type ListOptions = {
  role: RoleName;
  userId: string;
  organizationId?: string | null;
};

const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  imageUrl: true,
  signatureUrl: true,
  organizationId: true,
};

const prescriptionInclude = {
  doctor: {
    include: {
      user: {
        select: userSafeSelect,
      },
    },
  },
  patient: {
    include: {
      user: {
        select: userSafeSelect,
      },
    },
  },
  template: true,
  attachments: { include: { file: true } },
  versions: {
    select: {
      id: true,
      versionNumber: true,
      changeReason: true,
      createdAt: true,
      createdById: true,
    },
    orderBy: { versionNumber: "desc" as const },
  },
};

const prescriptionFullInclude = {
  doctor: {
    include: {
      user: {
        select: userSafeSelect,
      },
    },
  },
  patient: {
    include: {
      user: {
        select: userSafeSelect,
      },
    },
  },
  template: true,
  attachments: { include: { file: true } },
  appointment: true,
  versions: {
    orderBy: { versionNumber: "asc" as const },
  },
};

export async function listPrescriptions(options: ListOptions) {
  if (options.role === RoleName.DOCTOR) {
    return db.prescription.findMany({
      where: { doctor: { userId: options.userId } },
      include: prescriptionInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  if (options.role === RoleName.PATIENT) {
    return db.prescription.findMany({
      where: { patient: { userId: options.userId } },
      include: prescriptionInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  if (options.organizationId) {
    return db.prescription.findMany({
      where: { organizationId: options.organizationId },
      include: prescriptionInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  return db.prescription.findMany({
    include: prescriptionInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function createPrescription(input: unknown) {
  const data = prescriptionSchema.parse(input);

  const doc = await db.doctor.findUnique({
    where: { id: data.doctorId },
    include: {
      user: {
        select: { organizationId: true },
      },
    },
  });
  const orgId = doc?.user?.organizationId || null;
  const shareToken = `rx-${crypto.randomBytes(8).toString("hex")}`;

  const created = await db.$transaction(async (tx) => {
    let effectiveAppointmentId = data.appointmentId || null;
    if (!effectiveAppointmentId) {
      const today = new Date();
      const activeAppt = await tx.appointment.findFirst({
        where: {
          doctorId: data.doctorId,
          patientId: data.patientId,
          status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.BOOKED] },
          appointmentDate: {
            gte: startOfDay(today),
            lte: endOfDay(today),
          },
        },
        orderBy: { serialNumber: "asc" },
      });
      if (activeAppt) {
        effectiveAppointmentId = activeAppt.id;
      }
    }

    const prescription = await tx.prescription.create({
      data: {
        doctorId: data.doctorId,
        patientId: data.patientId,
        organizationId: orgId,
        appointmentId: effectiveAppointmentId || undefined,
        shareToken,
        isPublicShareEnabled: false,
        version: 1,
        notes: data.notes,
        medicinesJson: data.medicines,
        testsJson: data.tests,
        vitalsJson: (data.vitals ?? undefined) as Prisma.InputJsonValue | undefined,
        clinicalInfoJson: (data.clinicalInfo ?? undefined) as Prisma.InputJsonValue | undefined,
        doctorOverrideJson: (data.doctorOverride ?? undefined) as Prisma.InputJsonValue | undefined,
        templateId: data.templateId,
      },
    });

    if (effectiveAppointmentId) {
      await tx.appointment.update({
        where: { id: effectiveAppointmentId },
        data: { status: AppointmentStatus.COMPLETED },
      }).catch((err) => {
        console.warn("Failed to mark appointment as COMPLETED upon prescription creation:", err);
      });
    }

    // Save initial version snapshot (Version 1)
    await tx.prescriptionVersion.create({
      data: {
        prescriptionId: prescription.id,
        versionNumber: 1,
        changeReason: data.changeReason?.trim() || "Initial consultation prescription",
        medicinesJson: data.medicines,
        testsJson: data.tests,
        vitalsJson: (data.vitals ?? undefined) as Prisma.InputJsonValue | undefined,
        clinicalInfoJson: (data.clinicalInfo ?? undefined) as Prisma.InputJsonValue | undefined,
        doctorOverrideJson: (data.doctorOverride ?? undefined) as Prisma.InputJsonValue | undefined,
        notes: data.notes,
      },
    });

    if (data.clinicalInfo?.medicalHistory) {
      await tx.patient
        .update({
          where: { id: data.patientId },
          data: { medicalHistory: data.clinicalInfo.medicalHistory },
        })
        .catch(() => null);
    }

    if (data.attachmentIds.length) {
      await tx.prescriptionAttachment.createMany({
        data: data.attachmentIds.map((fileId) => ({
          prescriptionId: prescription.id,
          fileId,
        })),
        skipDuplicates: true,
      });
    }

    return tx.prescription.findUnique({
      where: { id: prescription.id },
      include: prescriptionFullInclude,
    });
  });

  if (created && created.patient?.user && created.doctor?.user) {
    // 1. Send Prescription System Notification & Email Notification (respecting on/off preferences)
    await sendPrescriptionAlert({
      prescriptionId: created.id,
      patientUserId: created.patient.userId,
      doctorName: created.doctor.user.name,
      patientName: created.patient.user.name,
      patientEmail: created.patient.user.email,
      organizationId: created.organizationId,
    }).catch(() => null);

    // 2. Log immutable activity audit event
    await logActivity({
      organizationId: created.organizationId,
      userId: created.doctor.userId,
      userName: created.doctor.user.name,
      userRole: "DOCTOR",
      action: "PRESCRIPTION_CREATED",
      entityType: "Prescription",
      entityId: created.id,
      detailsJson: {
        patientName: created.patient.user.name,
        medicinesCount: (data.medicines as unknown as unknown[]).length,
        testsCount: (data.tests as unknown as unknown[]).length,
      },
    }).catch(() => null);

    // 3. Automatically schedule medicine dosage reminders for patient
    await generateRemindersFromPrescription(created.id).catch(() => null);
  }

  return created;
}

export async function getPrescription(id: string, versionNumber?: number) {
  const item = await db.prescription.findUnique({
    where: { id },
    include: prescriptionFullInclude,
  });

  if (!item) {
    throw new AppError("Prescription not found", 404);
  }

  // If a specific version is requested, check if it exists in versions history
  if (versionNumber && versionNumber !== item.version) {
    const specificVersion = item.versions.find((v) => v.versionNumber === versionNumber);
    if (specificVersion) {
      return {
        ...item,
        version: specificVersion.versionNumber,
        medicinesJson: specificVersion.medicinesJson,
        testsJson: specificVersion.testsJson,
        vitalsJson: specificVersion.vitalsJson,
        clinicalInfoJson: specificVersion.clinicalInfoJson,
        doctorOverrideJson: specificVersion.doctorOverrideJson,
        notes: specificVersion.notes,
        createdAt: specificVersion.createdAt,
        currentVersionReason: specificVersion.changeReason,
        isHistoricalVersion: true,
        activeLatestVersion: item.version,
      };
    }
  }

  return item;
}

export async function updatePrescription(id: string, input: unknown) {
  const data = prescriptionUpdateSchema.parse(input);

  return db.$transaction(async (tx) => {
    const existing = await tx.prescription.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { versionNumber: "desc" } },
      },
    });

    if (!existing) {
      throw new AppError("Prescription not found", 404);
    }

    // Defensive check: if baseline v1 snapshot wasn't present, create it from existing state
    if (existing.versions.length === 0) {
      await tx.prescriptionVersion.create({
        data: {
          prescriptionId: id,
          versionNumber: existing.version || 1,
          changeReason: "Initial consultation prescription",
          medicinesJson: existing.medicinesJson as Prisma.InputJsonValue,
          testsJson: existing.testsJson as Prisma.InputJsonValue,
          vitalsJson: (existing.vitalsJson ?? undefined) as Prisma.InputJsonValue | undefined,
          clinicalInfoJson: (existing.clinicalInfoJson ?? undefined) as Prisma.InputJsonValue | undefined,
          doctorOverrideJson: (existing.doctorOverrideJson ?? undefined) as Prisma.InputJsonValue | undefined,
          notes: existing.notes,
          createdAt: existing.createdAt,
        },
      });
    }

    const nextVersion = (existing.version || 1) + 1;
    const finalMedicines = (data.medicines ?? existing.medicinesJson) as Prisma.InputJsonValue;
    const finalTests = (data.tests ?? existing.testsJson) as Prisma.InputJsonValue;
    const finalVitals = (data.vitals !== undefined ? data.vitals : existing.vitalsJson) ?? undefined;
    const finalClinicalInfo = (data.clinicalInfo !== undefined ? data.clinicalInfo : existing.clinicalInfoJson) ?? undefined;
    const finalDoctorOverride = (data.doctorOverride !== undefined ? data.doctorOverride : existing.doctorOverrideJson) ?? undefined;
    const finalNotes = data.notes !== undefined ? data.notes : existing.notes;
    const finalTemplateId =
      data.templateId !== undefined ? data.templateId : existing.templateId;

    // Update active prescription record
    await tx.prescription.update({
      where: { id },
      data: {
        version: nextVersion,
        medicinesJson: finalMedicines,
        testsJson: finalTests,
        vitalsJson: finalVitals as Prisma.InputJsonValue | undefined,
        clinicalInfoJson: finalClinicalInfo as Prisma.InputJsonValue | undefined,
        doctorOverrideJson: finalDoctorOverride as Prisma.InputJsonValue | undefined,
        notes: finalNotes,
        templateId: finalTemplateId,
        doctorId: data.doctorId ?? existing.doctorId,
        patientId: data.patientId ?? existing.patientId,
        appointmentId: data.appointmentId !== undefined ? data.appointmentId : existing.appointmentId,
      },
    });

    // Create new immutable PrescriptionVersion snapshot
    await tx.prescriptionVersion.create({
      data: {
        prescriptionId: id,
        versionNumber: nextVersion,
        changeReason: data.changeReason?.trim() || `Revision v${nextVersion}`,
        medicinesJson: finalMedicines,
        testsJson: finalTests,
        vitalsJson: finalVitals as Prisma.InputJsonValue | undefined,
        clinicalInfoJson: finalClinicalInfo as Prisma.InputJsonValue | undefined,
        doctorOverrideJson: finalDoctorOverride as Prisma.InputJsonValue | undefined,
        notes: finalNotes,
      },
    });

    if (data.clinicalInfo?.medicalHistory) {
      await tx.patient
        .update({
          where: { id: existing.patientId },
          data: { medicalHistory: data.clinicalInfo.medicalHistory },
        })
        .catch(() => null);
    }

    if (data.attachmentIds && data.attachmentIds.length > 0) {
      await tx.prescriptionAttachment.createMany({
        data: data.attachmentIds.map((fileId) => ({
          prescriptionId: id,
          fileId,
        })),
        skipDuplicates: true,
      });
    }

    return tx.prescription.findUnique({
      where: { id },
      include: prescriptionFullInclude,
    });
  });
}

export async function deletePrescription(id: string) {
  await db.prescription.delete({ where: { id } });
  return { deleted: true };
}
