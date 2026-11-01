import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/session";
import { RoleName, OrganizationStatus } from "@prisma/client";
import { getStripeServer } from "@/lib/stripe/stripe";
import { logActivity } from "@/features/activity-log/activity-log.service";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.ADMIN]);
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId")?.trim();

    if (!sessionId) {
      throw new AppError("Stripe checkout sessionId is required.", 400);
    }

    const stripe = getStripeServer();
    if (!stripe) {
      throw new AppError("Stripe server client is not configured.", 500);
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription", "customer"],
      });

      if (!session) {
        throw new AppError("Stripe checkout session not found.", 404);
      }

      if (session.payment_status !== "paid" && session.status !== "complete") {
        throw new AppError("Payment for this Stripe session has not completed yet.", 400);
      }

      const organizationId = session.metadata?.organizationId || session.client_reference_id;
      const planId = session.metadata?.planId;

      if (!organizationId) {
        throw new AppError("No organization attached to this checkout session.", 400);
      }

      const org = await db.organization.findUnique({
        where: { id: organizationId },
        include: { plan: true },
      });
      if (!org) {
        throw new AppError("Target clinic organization not found.", 404);
      }

      let newPlan = org.plan;
      if (planId) {
        const foundPlan = await db.pricingPlan.findUnique({ where: { id: planId } });
        if (foundPlan) newPlan = foundPlan;
      }

      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id || null;
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id || null;

      // 30 days subscription duration
      const subscriptionEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const updatedOrg = await db.organization.update({
        where: { id: org.id },
        data: {
          status: OrganizationStatus.ACTIVE,
          planId: newPlan?.id || org.planId,
          trialEndsAt: null,
          subscriptionStatus: "active",
          subscriptionEndsAt,
          stripeCustomerId: customerId || org.stripeCustomerId,
          stripeSubscriptionId: subscriptionId || org.stripeSubscriptionId,
        },
        include: { plan: true },
      });

      await logActivity({
        organizationId: org.id,
        userId: auth.sub,
        userName: auth.role,
        userRole: auth.role,
        action: "SUBSCRIPTION_ACTIVATED_VIA_STRIPE",
        entityType: "Subscription",
        entityId: subscriptionId || sessionId,
        detailsJson: {
          stripeSessionId: sessionId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          planName: newPlan?.name || "Subscribed Plan",
          amountTotal: session.amount_total ? session.amount_total / 100 : newPlan?.price,
          currency: session.currency,
        },
      });

      return ok({
        success: true,
        message: `Subscription confirmed via Stripe! Clinic upgraded to ${newPlan?.name || "Active"}.`,
        organization: updatedOrg,
      });
    } catch (stripeErr: unknown) {
      const errObj = stripeErr as Error;
      console.error("Stripe Session Verification Error:", errObj.message);
      throw new AppError(`Stripe Verification Error: ${errObj.message}`, 400);
    }
  });
}
