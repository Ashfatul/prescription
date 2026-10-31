import { endOfDay, startOfDay } from "date-fns";
import { AppointmentStatus, RoleName } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import {
  appointmentSchema,
  appointmentUpdateSchema,
} from "@/features/appointments/appointment.schema";

type ListOptions = {
  role: RoleName;
  userId: string;
};

export async function listAppointments(options: ListOptions) {
  if (options.role === RoleName.DOCTOR) {
    return db.appointment.findMany({
      where: { doctor: { userId: options.userId } },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
      orderBy: [{ appointmentDate: "asc" }, { serialNumber: "asc" }],
    });
  }

  if (options.role === RoleName.PATIENT) {
    return db.appointment.findMany({
      where: { patient: { userId: options.userId } },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
      orderBy: [{ appointmentDate: "desc" }, { serialNumber: "asc" }],
    });
  }

  return db.appointment.findMany({
    include: {
      doctor: { include: { user: true } },
      patient: { include: { user: true } },
    },
    orderBy: [{ appointmentDate: "desc" }, { serialNumber: "asc" }],
  });
}

export async function createAppointment(input: unknown) {
  const data = appointmentSchema.parse(input);
  const appointmentDate = new Date(data.appointmentDate);

  const maxToday = await db.appointment.findFirst({
    where: {
      doctorId: data.doctorId,
      appointmentDate: {
        gte: startOfDay(appointmentDate),
        lte: endOfDay(appointmentDate),
      },
      status: {
        not: AppointmentStatus.CANCELLED,
      },
    },
    orderBy: { serialNumber: "desc" },
  });

  const serial = (maxToday?.serialNumber ?? 0) + 1;

  return db.appointment.create({
    data: {
      doctorId: data.doctorId,
      patientId: data.patientId,
      appointmentDate,
      serialNumber: serial,
      notes: data.notes,
      status: AppointmentStatus.BOOKED,
    },
    include: {
      doctor: { include: { user: true } },
      patient: { include: { user: true } },
    },
  });
}

export async function updateAppointment(id: string, input: unknown) {
  const data = appointmentUpdateSchema.parse(input);

  const existing = await db.appointment.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Appointment not found", 404);
  }

  return db.appointment.update({
    where: { id },
    data,
  });
}

export async function deleteAppointment(id: string) {
  await db.appointment.delete({ where: { id } });
  return { deleted: true };
}
