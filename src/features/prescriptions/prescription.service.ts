import { Prisma, RoleName } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import {
  prescriptionSchema,
  prescriptionUpdateSchema,
} from "@/features/prescriptions/prescription.schema";

type ListOptions = {
  role: RoleName;
  userId: string;
};

export async function listPrescriptions(options: ListOptions) {
  if (options.role === RoleName.DOCTOR) {
    return db.prescription.findMany({
      where: { doctor: { userId: options.userId } },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
        template: true,
        attachments: { include: { file: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (options.role === RoleName.PATIENT) {
    return db.prescription.findMany({
      where: { patient: { userId: options.userId } },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
        template: true,
        attachments: { include: { file: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return db.prescription.findMany({
    include: {
      doctor: { include: { user: true } },
      patient: { include: { user: true } },
      template: true,
      attachments: { include: { file: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPrescription(input: unknown) {
  const data = prescriptionSchema.parse(input);

  return db.$transaction(async (tx) => {
    const prescription = await tx.prescription.create({
      data: {
        doctorId: data.doctorId,
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        notes: data.notes,
        medicinesJson: data.medicines,
        testsJson: data.tests,
        vitalsJson: (data.vitals ?? undefined) as Prisma.InputJsonValue | undefined,
        clinicalInfoJson: (data.clinicalInfo ?? undefined) as Prisma.InputJsonValue | undefined,
        doctorOverrideJson: (data.doctorOverride ?? undefined) as Prisma.InputJsonValue | undefined,
        templateId: data.templateId,
      },
    });

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
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
        template: true,
        attachments: { include: { file: true } },
      },
    });
  });
}

export async function getPrescription(id: string) {
  const item = await db.prescription.findUnique({
    where: { id },
    include: {
      doctor: { include: { user: true } },
      patient: { include: { user: true } },
      template: true,
      attachments: { include: { file: true } },
      appointment: true,
    },
  });

  if (!item) {
    throw new AppError("Prescription not found", 404);
  }

  return item;
}

export async function updatePrescription(id: string, input: unknown) {
  const data = prescriptionUpdateSchema.parse(input);

  const existing = await db.prescription.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Prescription not found", 404);
  }

  return db.prescription.update({
    where: { id },
    data: {
      doctorId: data.doctorId,
      patientId: data.patientId,
      appointmentId: data.appointmentId,
      notes: data.notes,
      medicinesJson: data.medicines,
      testsJson: data.tests,
      vitalsJson: (data.vitals ?? undefined) as Prisma.InputJsonValue | undefined,
      clinicalInfoJson: (data.clinicalInfo ?? undefined) as Prisma.InputJsonValue | undefined,
      doctorOverrideJson: (data.doctorOverride ?? undefined) as Prisma.InputJsonValue | undefined,
      templateId: data.templateId,
    },
  });
}

export async function deletePrescription(id: string) {
  await db.prescription.delete({ where: { id } });
  return { deleted: true };
}
