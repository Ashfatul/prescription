import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OrganizationStatus } from "@prisma/client";
import { getStripeServer } from "@/lib/stripe/stripe";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = getStripeServer();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err: unknown) {
    const errorObj = err as Error;
    console.error("Stripe Webhook Signature Verification Failed:", errorObj.message);
    return NextResponse.json({ error: `Webhook Error: ${errorObj.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // 1. Handle Doctor Consultation Appointment Fee Payment
        if (session.metadata?.type === "APPOINTMENT_FEE" || session.metadata?.appointmentId) {
          const appointmentId = session.metadata?.appointmentId;
          if (appointmentId) {
            const paymentIntentId =
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id || null;

            await db.appointment.update({
              where: { id: appointmentId },
              data: {
                paymentStatus: "PAID",
                paymentMethod: "STRIPE",
                stripeSessionId: session.id,
                stripePaymentIntentId: paymentIntentId,
              },
            });
          }
          break;
        }

        // 2. Handle Clinic Organization Subscription
        const organizationId = session.metadata?.organizationId || session.client_reference_id;
        const planId = session.metadata?.planId;

        if (organizationId) {
          const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

          await db.organization.update({
            where: { id: organizationId },
            data: {
              status: OrganizationStatus.ACTIVE,
              subscriptionStatus: "active",
              planId: planId || undefined,
              trialEndsAt: null,
              subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await db.organization.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: OrganizationStatus.SUSPENDED,
            subscriptionStatus: "canceled",
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const status = sub.status === "active" ? "active" : sub.status;
        await db.organization.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            subscriptionStatus: status,
            status: sub.status === "active" ? OrganizationStatus.ACTIVE : undefined,
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error processing Stripe webhook:", err);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
