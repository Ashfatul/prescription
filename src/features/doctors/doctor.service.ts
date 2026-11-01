import { startOfDay, endOfDay } from "date-fns";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { doctorSchema, doctorUpdateSchema } from "@/features/doctors/doctor.schema";

export async function listDoctors(organizationId?: string) {
  return db.doctor.findMany({
    where: organizationId
      ? {
          OR: [{ organizationId }, { user: { organizationId } }],
        }
      : undefined,
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDoctor(input: unknown, organizationId?: string) {
  const data = doctorSchema.parse(input);
  let orgId = organizationId;
  if (!orgId && data.userId) {
    const u = await db.user.findUnique({ where: { id: data.userId }, select: { organizationId: true } });
    if (u?.organizationId) orgId = u.organizationId;
  }

  return db.doctor.create({
    data: {
      userId: data.userId,
      organizationId: orgId || undefined,
      specialization: data.specialization,
      degrees: data.degrees,
      designation: data.designation,
      hospital: data.hospital,
      bmdcRegNo: data.bmdcRegNo,
      chamberAddress: data.chamberAddress,
      contactNumber: data.contactNumber,
      bio: data.bio,
      visitingHours: data.visitingHours,
      consultationFee: data.consultationFee,
      experienceYears: data.experienceYears,
      signatureUrl: data.signatureUrl,
      available: data.available,
      scheduleJson: data.scheduleJson as Prisma.InputJsonValue | undefined,
    },
    include: { user: true },
  });
}

export async function updateDoctor(id: string, input: unknown) {
  const data = doctorUpdateSchema.parse(input);
  const existing = await db.doctor.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Doctor not found", 404);
  }

  const updated = await db.doctor.update({
    where: { id },
    data: {
      ...data,
      scheduleJson: (data.scheduleJson ?? undefined) as Prisma.InputJsonValue | undefined,
    },
    include: { user: true },
  });

  if (data.signatureUrl !== undefined && existing.userId) {
    await db.user.update({
      where: { id: existing.userId },
      data: { signatureUrl: data.signatureUrl },
    });
  }

  return updated;
}

export async function deleteDoctor(id: string) {
  await db.doctor.delete({ where: { id } });
  return { deleted: true };
}

export async function getDoctorQueue(id: string) {
  const today = new Date();
  const queue = await db.appointment.findMany({
    where: {
      doctorId: id,
      appointmentDate: {
        gte: startOfDay(today),
        lte: endOfDay(today),
      },
      status: {
        not: AppointmentStatus.CANCELLED,
      },
    },
    include: {
      patient: {
        include: { user: true },
      },
    },
    orderBy: { serialNumber: "asc" },
  });

  const current = queue.find((item) => item.status === AppointmentStatus.BOOKED);

  return {
    currentSerial: current?.serialNumber ?? 0,
    total: queue.length,
    queue,
  };
}
