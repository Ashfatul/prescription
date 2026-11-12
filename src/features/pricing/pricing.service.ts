import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { Prisma } from "@prisma/client";

export type CreatePricingPlanParams = {
  name: string;
  price: number;
  billingCycle?: string;
  description?: string;
  features: string[];
  maxDoctors?: number | null;
  maxStaff?: number | null;
  maxPatients?: number | null;
  maxPrescriptionsPerMonth?: number | null;
  isPopular?: boolean;
  isActive?: boolean;
};

export const DEFAULT_PRICING_PLANS = [
  {
    id: "default-starter-plan",
    name: "Starter Clinic",
    price: 49,
    billingCycle: "monthly",
    description: "Essential prescribing & patient management for solo practitioners.",
    features: [
      "Up to 2 Doctor Accounts",
      "500 Prescriptions / month",
      "Drug & Test Formulary Access",
      "A4 Standard Printouts",
      "Patient Records & History",
      "Email Support",
    ],
    maxDoctors: 2,
    maxStaff: 2,
    maxPatients: 500,
    maxPrescriptionsPerMonth: 500,
    isPopular: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "default-pro-plan",
    name: "Professional Polyclinic",
    price: 149,
    billingCycle: "monthly",
    description: "Complete clinical OS for multi-doctor chambers and medical centers.",
    features: [
      "Up to 15 Doctor Accounts",
      "Unlimited Prescriptions",
      "Live Chamber Queue Dispenser",
      "QR Code & Public Link Prescription Sharing",
      "Test Report Uploads (Doctor & Patient)",
      "Google Calendar & Medicine Reminders",
      "Staff & Receptionist Triage Portal",
      "Patient-Doctor Approved Chat System",
      "24/7 Priority Clinical Support",
    ],
    maxDoctors: 15,
    maxStaff: 20,
    maxPatients: null,
    maxPrescriptionsPerMonth: null,
    isPopular: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "default-enterprise-plan",
    name: "Hospital Enterprise",
    price: 399,
    billingCycle: "monthly",
    description: "Comprehensive multi-specialty hospital infrastructure with custom integrations.",
    features: [
      "Unlimited Doctor & Staff Seats",
      "Multi-Branch SaaS Clinic Partitioning",
      "Custom Letterhead & Insignia Watermarking",
      "Full Audit & System Activity Logging",
      "Role-Based Admin Broadcast Announcements",
      "Dedicated Database & SLA Guarantee",
    ],
    maxDoctors: null,
    maxStaff: null,
    maxPatients: null,
    maxPrescriptionsPerMonth: null,
    isPopular: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function listPricingPlans(onlyActive = true) {
  try {
    const plans = await db.pricingPlan.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { price: "asc" },
    });
    if (plans && plans.length > 0) {
      return plans;
    }
    return DEFAULT_PRICING_PLANS.filter((p) => (onlyActive ? p.isActive : true));
  } catch (err) {
    console.error("Failed to load pricing plans from database:", err);
    return DEFAULT_PRICING_PLANS.filter((p) => (onlyActive ? p.isActive : true));
  }
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
      maxDoctors: params.maxDoctors,
      maxStaff: params.maxStaff,
      maxPatients: params.maxPatients,
      maxPrescriptionsPerMonth: params.maxPrescriptionsPerMonth,
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
      maxDoctors: data.maxDoctors,
      maxStaff: data.maxStaff,
      maxPatients: data.maxPatients,
      maxPrescriptionsPerMonth: data.maxPrescriptionsPerMonth,
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
