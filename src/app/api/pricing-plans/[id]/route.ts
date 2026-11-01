import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import {
  updatePricingPlan,
  deletePricingPlan,
} from "@/features/pricing/pricing.service";
import { RoleName } from "@prisma/client";
import { ok } from "@/lib/http";

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
