import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { createGoogleCalendarMedicineReminderUrl } from "@/lib/calendar";
import { createNotification } from "@/features/notifications/notification.service";
import { NotificationType } from "@prisma/client";

export async function listMedicineReminders(patientId: string) {
  return db.medicineReminder.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createMedicineReminder(params: {
  patientId: string;
  prescriptionId?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  timeOfDay: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  organizationId?: string | null;
}) {
  const googleCalUrl = createGoogleCalendarMedicineReminderUrl({
    medicineName: params.medicineName,
    dosage: params.dosage,
    frequency: params.frequency,
    timing: params.timeOfDay,
    instructions: params.notes,
    startDate: params.startDate,
  });

  return db.medicineReminder.create({
    data: {
      patientId: params.patientId,
      prescriptionId: params.prescriptionId,
      medicineName: params.medicineName,
      dosage: params.dosage,
      frequency: params.frequency,
      timeOfDay: params.timeOfDay,
      startDate: params.startDate || new Date(),
      endDate: params.endDate,
      notes: params.notes,
      googleCalUrl,
      organizationId: params.organizationId,
    },
  });
}

export async function generateRemindersFromPrescription(prescriptionId: string) {
  const prescription = await db.prescription.findUnique({
    where: { id: prescriptionId },
    include: {
      patient: {
        select: { userId: true },
      },
    },
  });

  if (!prescription) {
    throw new AppError("Prescription not found", 404);
  }

  const medicines = Array.isArray(prescription.medicinesJson)
    ? (prescription.medicinesJson as Array<{
        name: string;
        dosage?: string;
        dose?: string;
        timing?: string;
        duration?: string;
        instructions?: string;
      }>)
    : [];

  if (medicines.length === 0) {
    return [];
  }

  const createdReminders = [];

  for (const med of medicines) {
    const timeOfDay = med.timing || (med.dose === "1+0+1" ? "Morning & Night" : med.dose || "Daily");
    const googleCalUrl = createGoogleCalendarMedicineReminderUrl({
      medicineName: med.name,
      dosage: med.dosage || "Standard",
      frequency: med.dose || "1+0+1",
      timing: timeOfDay,
      instructions: med.instructions,
    });

    const reminder = await db.medicineReminder.create({
      data: {
        patientId: prescription.patientId,
        prescriptionId: prescription.id,
        medicineName: med.name,
        dosage: med.dosage || "Standard",
        frequency: med.dose || "1+0+1",
        timeOfDay,
        notes: med.instructions || med.timing || "As prescribed",
        googleCalUrl,
        organizationId: prescription.organizationId,
      },
    });

    createdReminders.push(reminder);
  }

  // Send in-app notification to patient
  await createNotification({
    userId: prescription.patient.userId,
    title: "Medicine Schedule Reminders Added",
    message: `${medicines.length} medicine dosage reminders have been created from your prescription. You can sync them to Google Calendar.`,
    type: NotificationType.SYSTEM,
  });

  return createdReminders;
}

export async function toggleMedicineReminder(id: string, isActive: boolean) {
  return db.medicineReminder.update({
    where: { id },
    data: { isActive },
  });
}

export async function deleteMedicineReminder(id: string) {
  return db.medicineReminder.delete({
    where: { id },
  });
}
