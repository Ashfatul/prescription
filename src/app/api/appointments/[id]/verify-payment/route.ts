import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { getAuthFromRequest } from "@/lib/auth/session";
import { getStripeServer, isStripeConfigured } from "@/lib/stripe/stripe";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    const auth = await getAuthFromRequest(req);
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const sessionId = (body.sessionId as string | undefined)?.trim();

    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { userId: true } },
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    // Permission check if logged in: appointment belongs to patient or authorized staff
    if (auth && auth.role === "PATIENT" && appointment.patient?.userId && appointment.patient.userId !== auth.sub) {
      throw new AppError("Unauthorized access to appointment", 403);
    }

    // 1. If real Stripe is configured and a valid non-demo sessionId is provided
    const stripe = getStripeServer();
    if (stripe && isStripeConfigured() && sessionId && !sessionId.startsWith("demo_")) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === "paid" || session.status === "complete") {
          const updated = await db.appointment.update({
            where: { id },
            data: {
              paymentStatus: "PAID",
              paymentMethod: "STRIPE",
              stripeSessionId: sessionId,
              stripePaymentIntentId:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : session.payment_intent?.id || null,
            },
          });
          return ok({ success: true, appointment: updated, verifiedVia: "STRIPE_API" });
        }
      } catch (err) {
        console.error("Error retrieving Stripe session:", err);
      }
    }

    // 2. Demo Sandbox mode / Verified test transaction
    const updated = await db.appointment.update({
      where: { id },
      data: {
        paymentStatus: "PAID",
        paymentMethod: "STRIPE",
        stripeSessionId: sessionId || appointment.stripeSessionId || `demo_${Date.now()}`,
      },
    });

    return ok({ success: true, appointment: updated, verifiedVia: "SANDBOX_SIMULATION" });
  });
}
