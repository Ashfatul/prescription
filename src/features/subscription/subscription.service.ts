import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { OrganizationStatus } from "@prisma/client";
import { logActivity } from "@/features/activity-log/activity-log.service";

export type ClinicSubscriptionInfo = {
  organizationId: string;
  organizationName: string;
  slug: string;
  status: OrganizationStatus;
  plan: {
    id: string;
    name: string;
    price: number;
    billingCycle: string;
    description: string | null;
    features: string[];
  } | null;
  isTrial: boolean;
  trialEndsAt: string | null;
  msLeft: number;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  secondsLeft: number;
  isTrialExpired: boolean;
  subscriptionStatus: string;
  subscriptionEndsAt: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  counts: {
    doctors: number;
    staff: number;
    prescriptions: number;
    appointments: number;
  };
};

export async function getClinicSubscription(organizationId: string): Promise<ClinicSubscriptionInfo> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    include: {
      plan: true,
      _count: {
        select: {
          prescriptions: true,
          appointments: true,
        },
      },
    },
  });

  if (!org) {
    throw new AppError("Organization not found", 404);
  }

  const [doctorsCount, staffCount] = await Promise.all([
    db.user.count({
      where: {
        organizationId: org.id,
        role: { name: "DOCTOR" },
      },
    }),
    db.user.count({
      where: {
        organizationId: org.id,
        role: { name: "STAFF" },
      },
    }),
  ]);

  const isTrial = org.status === OrganizationStatus.TRIAL;
  const trialEndsDate = org.trialEndsAt ? new Date(org.trialEndsAt) : null;
  const now = new Date();

  let msLeft = 0;
  let isTrialExpired = false;

  if (isTrial && trialEndsDate) {
    msLeft = Math.max(0, trialEndsDate.getTime() - now.getTime());
    isTrialExpired = trialEndsDate < now;
  }

  const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
  const secondsLeft = Math.floor((msLeft % (1000 * 60)) / 1000);

  return {
    organizationId: org.id,
    organizationName: org.name,
    slug: org.slug,
    status: org.status,
    plan: org.plan
      ? {
          id: org.plan.id,
          name: org.plan.name,
          price: org.plan.price,
          billingCycle: org.plan.billingCycle,
          description: org.plan.description,
          features: Array.isArray(org.plan.features) ? (org.plan.features as string[]) : [],
        }
      : null,
    isTrial,
    trialEndsAt: org.trialEndsAt ? org.trialEndsAt.toISOString() : null,
    msLeft,
    daysLeft,
    hoursLeft,
    minutesLeft,
    secondsLeft,
    isTrialExpired,
    subscriptionStatus: org.subscriptionStatus || (isTrial ? "trialing" : "active"),
    subscriptionEndsAt: org.subscriptionEndsAt ? org.subscriptionEndsAt.toISOString() : null,
    stripeCustomerId: org.stripeCustomerId,
    stripeSubscriptionId: org.stripeSubscriptionId,
    counts: {
      doctors: doctorsCount,
      staff: staffCount,
      prescriptions: org._count.prescriptions,
      appointments: org._count.appointments,
    },
  };
}

export type ProcessUpgradeParams = {
  organizationId: string;
  planId: string;
  cardHolder?: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  userId?: string;
  userName?: string;
};

export async function processStripeSandboxUpgrade(params: ProcessUpgradeParams) {
  const org = await db.organization.findUnique({
    where: { id: params.organizationId },
    include: { plan: true },
  });

  if (!org) {
    throw new AppError("Organization not found", 404);
  }

  const newPlan = await db.pricingPlan.findUnique({
    where: { id: params.planId },
  });

  if (!newPlan) {
    throw new AppError("Selected pricing plan not found", 404);
  }

  // Clean and validate card details
  const cleanCardNumber = params.cardNumber.replace(/\s+/g, "");
  if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
    throw new AppError("Invalid card number format for Stripe Sandbox", 400);
  }

  // Test failure simulation for Stripe sandbox cards
  if (cleanCardNumber.endsWith("0002")) {
    throw new AppError("Stripe Sandbox: Card was declined (test card code: declined)", 402);
  }
  if (cleanCardNumber.endsWith("0069")) {
    throw new AppError("Stripe Sandbox: Insufficient funds (test card code: insufficient_funds)", 402);
  }

  const cardLast4 = cleanCardNumber.slice(-4);
  const mockSubId = `sub_sandbox_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
  const mockCustId = org.stripeCustomerId || `cus_sandbox_${Math.random().toString(36).substring(2, 9)}`;

  // 30 days subscription duration
  const subscriptionEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Update organization to ACTIVE with upgraded plan
  const updatedOrg = await db.organization.update({
    where: { id: org.id },
    data: {
      status: OrganizationStatus.ACTIVE,
      planId: newPlan.id,
      trialEndsAt: null,
      subscriptionStatus: "active",
      subscriptionEndsAt,
      stripeSubscriptionId: mockSubId,
      stripeCustomerId: mockCustId,
    },
    include: { plan: true },
  });

  // Log audit activity
  await logActivity({
    organizationId: org.id,
    userId: params.userId,
    userName: params.userName || "Clinic Admin",
    userRole: "SUPER_ADMIN",
    action: "SUBSCRIPTION_UPGRADED",
    entityType: "Subscription",
    entityId: mockSubId,
    detailsJson: {
      planName: newPlan.name,
      price: newPlan.price,
      billingCycle: newPlan.billingCycle,
      cardLast4,
      stripeSubscriptionId: mockSubId,
      stripeCustomerId: mockCustId,
      paymentMode: "STRIPE_SANDBOX_TESTMODE",
    },
  });

  return {
    success: true,
    message: `Clinic successfully upgraded to ${newPlan.name}!`,
    organization: updatedOrg,
    plan: newPlan,
    subscription: {
      status: "active",
      endsAt: subscriptionEndsAt,
      stripeSubscriptionId: mockSubId,
    },
  };
}
