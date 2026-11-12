import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import {
  updatePricingPlan,
  deletePricingPlan,
} from "@/features/pricing/pricing.service";
import { RoleName } from "@prisma/client";
import { ok } from "@/lib/http";

function parseOptionalLimit(val: unknown): number | null | undefined {
  if (val === undefined) return undefined;
  if (val === null || val === "" || val === "unlimited") return null;
  const num = Number(val);
  return isNaN(num) ? null : Math.max(0, Math.floor(num));
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN]);
    const { id } = await context.params;
    const body = await req.json();

    const updated = await updatePricingPlan(id, {
      ...body,
      price: body.price !== undefined ? Number(body.price) : undefined,
      maxDoctors: parseOptionalLimit(body.maxDoctors),
      maxStaff: parseOptionalLimit(body.maxStaff),
      maxPatients: parseOptionalLimit(body.maxPatients),
      maxPrescriptionsPerMonth: parseOptionalLimit(body.maxPrescriptionsPerMonth),
    });
    return ok(updated);
  });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN]);
    const { id } = await context.params;

    await deletePricingPlan(id);
    return ok({ success: true });
  });
}
