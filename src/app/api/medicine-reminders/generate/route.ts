import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import { generateRemindersFromPrescription } from "@/features/medicine-reminders/medicine-reminder.service";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    await requireUser(req);
    const body = await req.json();

    if (!body.prescriptionId) {
      throw new AppError("prescriptionId is required", 400);
    }

    const reminders = await generateRemindersFromPrescription(body.prescriptionId);
    return ok(reminders, 201);
  });
}
