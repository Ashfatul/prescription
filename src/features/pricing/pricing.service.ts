import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { Prisma } from "@prisma/client";

export type CreatePricingPlanParams = {
  name: string;
  price: number;
  billingCycle?: string;
  description?: string;
  features: string[];
  isPopular?: boolean;
  isActive?: boolean;
};

export async function listPricingPlans(onlyActive = true) {
  return db.pricingPlan.findMany({
    where: onlyActive ? { isActive: true } : undefined,
    orderBy: { price: "asc" },
  });
}

export async function createPricingPlan(params: CreatePricingPlanParams) {
  const existing = await db.pricingPlan.findUnique({
    where: { name: params.name },
  });

  if (existing) {
    throw new AppError("Plan with this name already exists", 409);
  }

  return db.pricingPlan.create({
    data: {
      name: params.name,
      price: params.price,
      billingCycle: params.billingCycle || "monthly",
      description: params.description,
      features: params.features as unknown as Prisma.InputJsonValue,
      isPopular: params.isPopular || false,
      isActive: params.isActive !== undefined ? params.isActive : true,
    },
  });
}

export async function updatePricingPlan(
  id: string,
  data: Partial<CreatePricingPlanParams>
) {
  const existing = await db.pricingPlan.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Pricing plan not found", 404);
  }

  return db.pricingPlan.update({
    where: { id },
    data: {
      name: data.name,
      price: data.price,
      billingCycle: data.billingCycle,
      description: data.description,
      features: data.features !== undefined ? (data.features as unknown as Prisma.InputJsonValue) : undefined,
      isPopular: data.isPopular,
      isActive: data.isActive,
    },
  });
}

export async function deletePricingPlan(id: string) {
  const existing = await db.pricingPlan.findUnique({
    where: { id },
    include: { _count: { select: { organizations: true } } },
  });

  if (!existing) {
    throw new AppError("Pricing plan not found", 404);
  }

  if (existing._count.organizations > 0) {
    throw new AppError("Cannot delete plan currently assigned to active clinics.", 400);
  }

  return db.pricingPlan.delete({ where: { id } });
}
