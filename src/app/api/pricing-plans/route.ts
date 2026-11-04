import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import {
  listPricingPlans,
  createPricingPlan,
} from "@/features/pricing/pricing.service";
import { RoleName } from "@prisma/client";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";
    const plans = await listPricingPlans(!all);
    return ok(plans);
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN]);
    const body = await req.json();

    if (!body.name || body.price === undefined) {
      throw new AppError("Plan name and price are required", 400);
    }

    const plan = await createPricingPlan({
      name: body.name,
      price: Number(body.price),
      billingCycle: body.billingCycle || "monthly",
      description: body.description,
      features: Array.isArray(body.features) ? body.features : [body.features].filter(Boolean),
      maxDoctors: body.maxDoctors == null || body.maxDoctors === "" ? null : Number(body.maxDoctors),
      maxStaff: body.maxStaff == null || body.maxStaff === "" ? null : Number(body.maxStaff),
      maxPatients: body.maxPatients == null || body.maxPatients === "" ? null : Number(body.maxPatients),
      maxPrescriptionsPerMonth: body.maxPrescriptionsPerMonth == null || body.maxPrescriptionsPerMonth === "" ? null : Number(body.maxPrescriptionsPerMonth),
      isPopular: !!body.isPopular,
      isActive: body.isActive !== undefined ? !!body.isActive : true,
    });

    return ok(plan, 201);
  });
}
