import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/session";
import { getStripeServer, isStripeConfigured } from "@/lib/stripe/stripe";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);
    const { id } = await context.params;

    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
        patient: { select: { id: true, userId: true } },
      },
    });

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    if (auth.role === "PATIENT" && appointment.patient?.userId && appointment.patient.userId !== auth.sub) {
      throw new AppError("Unauthorized access to appointment payment", 403);
    }

    if (appointment.paymentStatus === "PAID") {
      throw new AppError("Appointment is already paid", 400);
    }

    const fee = appointment.fee ?? 0;
    if (fee <= 0) {
      // Free consultation or waived
      await db.appointment.update({
        where: { id },
        data: { paymentStatus: "WAIVED", paymentMethod: "WAIVED" },
      });
      return ok({ success: true, isFree: true });
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const origin = `${protocol}://${host}`;

    const stripe = getStripeServer();

    if (!stripe || !isStripeConfigured()) {
      throw new AppError(
        "Stripe Checkout is not configured. Set STRIPE_SECRET_KEY in the server environment.",
        503,
      );
    }

    try {
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Doctor Consultation - ${appointment.doctor.user.name}`,
                  description: `${
                    appointment.visitType === "FOLLOWUP" ? "Follow-up Consultation" : "New Patient Visit"
                  } • Serial #${appointment.serialNumber}`,
                },
                unit_amount: Math.round(fee * 100),
              },
              quantity: 1,
            },
          ],
          metadata: {
            type: "APPOINTMENT_FEE",
            appointmentId: appointment.id,
            doctorId: appointment.doctorId,
            patientId: appointment.patientId,
          },
          success_url:
            auth.role === "ADMIN" || auth.role === "SUPER_ADMIN"
              ? `${origin}/dashboard/admin?tab=appointments&paid=true&appointment_id=${appointment.id}&session_id={CHECKOUT_SESSION_ID}`
              : auth.role === "STAFF"
              ? `${origin}/dashboard/staff?tab=appointments&paid=true&appointment_id=${appointment.id}&session_id={CHECKOUT_SESSION_ID}`
              : auth.role === "DOCTOR"
              ? `${origin}/dashboard/doctor?tab=appointments&paid=true&appointment_id=${appointment.id}&session_id={CHECKOUT_SESSION_ID}`
              : `${origin}/dashboard/patient?tab=overview&paid=true&appointment_id=${appointment.id}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url:
            auth.role === "ADMIN" || auth.role === "SUPER_ADMIN"
              ? `${origin}/dashboard/admin?tab=appointments&canceled=true&appointment_id=${appointment.id}`
              : auth.role === "STAFF"
              ? `${origin}/dashboard/staff?tab=appointments&canceled=true&appointment_id=${appointment.id}`
              : auth.role === "DOCTOR"
              ? `${origin}/dashboard/doctor?tab=appointments&canceled=true&appointment_id=${appointment.id}`
              : `${origin}/dashboard/patient?tab=overview&canceled=true&appointment_id=${appointment.id}`,
        });

        await db.appointment.update({
          where: { id },
          data: { stripeSessionId: session.id, paymentMethod: "STRIPE" },
        });

        return ok({
          success: true,
          isRealStripe: true,
          url: session.url,
          sessionId: session.id,
        });
    } catch (stripeErr: unknown) {
      const err = stripeErr as Error;
      console.error("Failed to generate Stripe checkout session:", err.message);
      throw new AppError(`Stripe Error: ${err.message}`, 400);
    }
  });
}
