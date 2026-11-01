import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import {
  listMedicineReminders,
  createMedicineReminder,
} from "@/features/medicine-reminders/medicine-reminder.service";
import { db } from "@/lib/db";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const patientIdParam = searchParams.get("patientId");

    let patientId = patientIdParam;

    if (!patientId) {
      const patient = await db.patient.findUnique({
        where: { userId: user.sub },
      });
      if (patient) {
        patientId = patient.id;
      }
    }

    if (!patientId) {
      return ok([]);
    }

    const reminders = await listMedicineReminders(patientId);
    return ok(reminders);
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const body = await req.json();

    let patientId = body.patientId;
    if (!patientId) {
      const patient = await db.patient.findUnique({
        where: { userId: user.sub },
      });
      if (!patient) {
        throw new AppError("Patient profile required", 400);
      }
      patientId = patient.id;
    }

    const reminder = await createMedicineReminder({
      patientId,
      prescriptionId: body.prescriptionId,
      medicineName: body.medicineName,
      dosage: body.dosage || "Standard",
      frequency: body.frequency || "Daily",
      timeOfDay: body.timeOfDay || "Morning",
      notes: body.notes,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });

    return ok(reminder, 201);
  });
}
