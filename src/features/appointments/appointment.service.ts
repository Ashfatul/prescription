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
  organizationId?: string | null;
};

const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  imageUrl: true,
};

const appointmentInclude = {
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
};

export async function listAppointments(options: ListOptions) {
  if (options.role === RoleName.DOCTOR) {
    return db.appointment.findMany({
      where: { doctor: { userId: options.userId } },
      include: appointmentInclude,
      orderBy: [{ appointmentDate: "asc" }, { serialNumber: "asc" }],
    });
  }

  if (options.role === RoleName.PATIENT) {
    return db.appointment.findMany({
      where: { patient: { userId: options.userId } },
      include: appointmentInclude,
      orderBy: [{ appointmentDate: "desc" }, { serialNumber: "asc" }],
    });
  }

  if (options.organizationId) {
    return db.appointment.findMany({
      where: { organizationId: options.organizationId },
      include: appointmentInclude,
      orderBy: [{ appointmentDate: "desc" }, { serialNumber: "asc" }],
    });
  }

  return db.appointment.findMany({
    include: appointmentInclude,
    orderBy: [{ appointmentDate: "desc" }, { serialNumber: "asc" }],
  });
}

export async function createAppointment(
  input: unknown,
  authUser?: { role: RoleName; userId: string; organizationId?: string | null }
) {
  const data = appointmentSchema.parse(input);
  const appointmentDate = new Date(data.appointmentDate);

  if (isNaN(appointmentDate.getTime())) {
    throw new AppError("Invalid appointment date", 400);
  }

  let finalPatientId = data.patientId;

  if (!finalPatientId && authUser) {
    let patient = await db.patient.findUnique({
      where: { userId: authUser.userId },
    });
    if (!patient && authUser.role === RoleName.PATIENT) {
      patient = await db.patient.create({
        data: {
          userId: authUser.userId,
          organizationId: authUser.organizationId || undefined,
        },
      });
    }
    finalPatientId = patient?.id;
  }

  if (!finalPatientId) {
    throw new AppError("Patient identification is required to book an appointment", 400);
  }

  const doctorRec = await db.doctor.findUnique({
    where: { id: data.doctorId },
    select: { organizationId: true, user: { select: { organizationId: true } } },
  });
  const orgId = authUser?.organizationId || doctorRec?.organizationId || doctorRec?.user?.organizationId || undefined;

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
      patientId: finalPatientId,
      organizationId: orgId,
      appointmentDate,
      serialNumber: serial,
      notes: data.notes,
      status: AppointmentStatus.BOOKED,
    },
    include: appointmentInclude,
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
