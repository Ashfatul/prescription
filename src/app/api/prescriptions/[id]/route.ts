import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import {
  deletePrescription,
  getPrescription,
  updatePrescription,
} from "@/features/prescriptions/prescription.service";
import { requireUser } from "@/lib/auth/session";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    await requireUser(req);
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const versionParam = searchParams.get("version");
    const versionNumber = versionParam ? parseInt(versionParam, 10) : undefined;
    return ok(await getPrescription(id, isNaN(Number(versionNumber)) ? undefined : versionNumber));
  });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    await requireUser(req);
    const { id } = await context.params;
    return ok(await updatePrescription(id, await req.json()));
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    await requireUser(req);
    const { id } = await context.params;
    return ok(await deletePrescription(id));
  });
}
