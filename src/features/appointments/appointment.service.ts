import { endOfDay, startOfDay } from "date-fns";
import { AppointmentStatus, RoleName } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import {
  appointmentSchema,
  appointmentUpdateSchema,
} from "@/features/appointments/appointment.schema";
import { getStripeServer, isStripeConfigured } from "@/lib/stripe/stripe";

type ListOptions = {
  role: RoleName;
  userId: string;
  organizationId?: string | null;
};

const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  imageUrl: true,
};

const appointmentInclude = {
  doctor: {
    include: {
      user: {
        select: userSafeSelect,
      },
    },
  },
  patient: {
    include: {
      user: {
        select: userSafeSelect,
      },
    },
  },
};

export async function listAppointments(options: ListOptions) {
  if (options.role === RoleName.DOCTOR) {
    return db.appointment.findMany({
      where: { doctor: { userId: options.userId } },
      include: appointmentInclude,
      orderBy: [{ appointmentDate: "asc" }, { serialNumber: "asc" }],
    });
  }

  if (options.role === RoleName.PATIENT) {
    return db.appointment.findMany({
      where: { patient: { userId: options.userId } },
      include: appointmentInclude,
      orderBy: [{ appointmentDate: "desc" }, { serialNumber: "asc" }],
    });
  }

  if (options.organizationId) {
    return db.appointment.findMany({
      where: { organizationId: options.organizationId },
      include: appointmentInclude,
      orderBy: [{ appointmentDate: "desc" }, { serialNumber: "asc" }],
    });
  }

  return db.appointment.findMany({
    include: appointmentInclude,
    orderBy: [{ appointmentDate: "desc" }, { serialNumber: "asc" }],
  });
}

export async function calculateDoctorConsultationFee(doctorId: string, patientId?: string) {
  const doctor = await db.doctor.findUnique({
    where: { id: doctorId },
    select: {
      id: true,
      consultationFee: true,
      newPatientFee: true,
      followupFee: true,
      followupValidityDays: true,
      reportFreeDays: true,
      user: { select: { name: true } },
    },
  });

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  const newPatientFee = doctor.newPatientFee ?? 50;
  const followupFee = doctor.followupFee ?? 30;
  const followupValidityDays = doctor.followupValidityDays ?? 90;
  const reportFreeDays = doctor.reportFreeDays ?? 2;

  if (!patientId) {
    return {
      visitType: "NEW" as const,
      fee: newPatientFee,
      isFreeReportReview: false,
      followupEligible: false,
      newPatientFee,
      followupFee,
      followupValidityDays,
      reportFreeDays,
      reason: "Standard First Consultation Visit",
    };
  }

  // Check for previous completed appointment or prescription with this doctor
  const [latestPrescription, latestAppointment] = await Promise.all([
    db.prescription.findFirst({
      where: {
        doctorId,
        patientId,
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, version: true },
    }),
    db.appointment.findFirst({
      where: {
        doctorId,
        patientId,
        status: AppointmentStatus.COMPLETED,
      },
      orderBy: { appointmentDate: "desc" },
      select: {
        id: true,
        appointmentDate: true,
        prescription: { select: { id: true } },
      },
    }),
  ]);

  let lastVisitDate: Date | null = null;
  let previousPrescriptionId: string | null = null;

  if (latestPrescription && latestAppointment) {
    if (latestPrescription.createdAt.getTime() >= latestAppointment.appointmentDate.getTime()) {
      lastVisitDate = latestPrescription.createdAt;
      previousPrescriptionId = latestPrescription.id;
    } else {
      lastVisitDate = latestAppointment.appointmentDate;
      previousPrescriptionId = latestAppointment.prescription?.id || latestAppointment.id;
    }
  } else if (latestPrescription) {
    lastVisitDate = latestPrescription.createdAt;
    previousPrescriptionId = latestPrescription.id;
  } else if (latestAppointment) {
    lastVisitDate = latestAppointment.appointmentDate;
    previousPrescriptionId = latestAppointment.prescription?.id || latestAppointment.id;
  }

  if (!lastVisitDate) {
    return {
      visitType: "NEW" as const,
      fee: newPatientFee,
      isFreeReportReview: false,
      followupEligible: false,
      previousPrescriptionId: null,
      daysSinceLastVisit: null,
      lastVisitDate: null,
      newPatientFee,
      followupFee,
      followupValidityDays,
      reportFreeDays,
      reason: `First Visit: No previous consultation or prescription record found with Dr. ${doctor.user.name}.`,
    };
  }

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastVisitDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Case 1: Within report review free window (e.g. <= 2 days after first visit)
  if (diffDays <= reportFreeDays) {
    return {
      visitType: "REPORT_REVIEW" as const,
      fee: 0,
      isFreeReportReview: true,
      followupEligible: true,
      previousPrescriptionId,
      daysSinceLastVisit: diffDays,
      lastVisitDate,
      newPatientFee,
      followupFee,
      followupValidityDays,
      reportFreeDays,
      reason: `Eligible for Free Diagnostic Report Review (Within ${reportFreeDays} days of prior consultation - Day ${diffDays}).`,
    };
  }

  // Case 2: Within followup validity window (e.g. <= 90 days / 3 months)
  if (diffDays <= followupValidityDays) {
    return {
      visitType: "FOLLOWUP" as const,
      fee: followupFee,
      isFreeReportReview: false,
      followupEligible: true,
      previousPrescriptionId,
      daysSinceLastVisit: diffDays,
      lastVisitDate,
      newPatientFee,
      followupFee,
      followupValidityDays,
      reportFreeDays,
      reason: `Eligible for Follow-up Consultation Rate (Prior visit ${diffDays} days ago, valid up to ${followupValidityDays} days / 3 months).`,
    };
  }

  // Case 3: Beyond followup validity window (> 90 days)
  return {
    visitType: "NEW" as const,
    fee: newPatientFee,
    isFreeReportReview: false,
    followupEligible: false,
    previousPrescriptionId,
    daysSinceLastVisit: diffDays,
    lastVisitDate,
    newPatientFee,
    followupFee,
    followupValidityDays,
    reportFreeDays,
    reason: `Prior visit with Dr. ${doctor.user.name} was ${diffDays} days ago (exceeds ${followupValidityDays}-day follow-up validity window). First visit fee applies.`,
  };
}

export async function createAppointment(
  input: unknown,
  authUser?: { role: RoleName; userId: string; organizationId?: string | null },
  requestOrigin?: string
) {
  const data = appointmentSchema.parse(input);
  const appointmentDate = new Date(data.appointmentDate);

  if (isNaN(appointmentDate.getTime())) {
    throw new AppError("Invalid appointment date", 400);
  }

  let finalPatientId = data.patientId;

  if (!finalPatientId && authUser) {
    let patient = await db.patient.findUnique({
      where: { userId: authUser.userId },
    });
    if (!patient && authUser.role === RoleName.PATIENT) {
      patient = await db.patient.create({
        data: {
          userId: authUser.userId,
          organizationId: authUser.organizationId || undefined,
        },
      });
    }
    finalPatientId = patient?.id;
  }

  if (!finalPatientId) {
    throw new AppError("Patient identification is required to book an appointment", 400);
  }

  const doctorRec = await db.doctor.findUnique({
    where: { id: data.doctorId },
    include: {
      user: { select: { name: true, organizationId: true } },
    },
  });
  if (!doctorRec) {
    throw new AppError("Doctor not found", 404);
  }

  const orgId =
    authUser?.organizationId ||
    doctorRec.organizationId ||
    doctorRec.user?.organizationId ||
    undefined;

  // Calculate fees dynamically based on doctor policy and patient history
  const calculatedFee = await calculateDoctorConsultationFee(data.doctorId, finalPatientId);

  const visitType = data.visitType || calculatedFee.visitType;

  // Strict backend validation for visit type and eligibility:
  if (visitType === "FOLLOWUP") {
    if (!calculatedFee.followupEligible) {
      if (!calculatedFee.lastVisitDate) {
        throw new AppError(
          `Ineligible for Follow-up: No prior consultation or prescription found with Dr. ${doctorRec.user.name}. Please select First Visit.`,
          400
        );
      }
      throw new AppError(
        `Ineligible for Follow-up: Prior consultation with Dr. ${doctorRec.user.name} was ${calculatedFee.daysSinceLastVisit} days ago, exceeding the ${calculatedFee.followupValidityDays}-day follow-up limit. Please select First Visit.`,
        400
      );
    }
  } else if (visitType === "REPORT_REVIEW") {
    if (!calculatedFee.isFreeReportReview) {
      if (!calculatedFee.lastVisitDate) {
        throw new AppError(
          `Ineligible for Free Report Review: Complimentary report review requires a prior consultation with Dr. ${doctorRec.user.name}. Please select First Visit.`,
          400
        );
      }
      throw new AppError(
        `Ineligible for Free Report Review: Complimentary report review is only valid within ${calculatedFee.reportFreeDays} days of prior consultation. Your last visit was ${calculatedFee.daysSinceLastVisit} days ago. Please select Follow-up or First Visit.`,
        400
      );
    }
  }

  let finalFee = 0;
  if (visitType === "REPORT_REVIEW") {
    finalFee = 0;
  } else if (data.fee !== undefined) {
    finalFee = data.fee;
  } else if (visitType === "FOLLOWUP") {
    finalFee = calculatedFee.followupFee;
  } else {
    finalFee = calculatedFee.newPatientFee;
  }

  let paymentStatus = data.paymentStatus;
  let paymentMethod = data.paymentMethod;

  if (finalFee === 0) {
    paymentStatus = "WAIVED";
    paymentMethod = "WAIVED";
  } else if (paymentMethod === "CASH" || paymentMethod === "CARD_POS") {
    paymentStatus = "PAID";
  } else if (!paymentStatus) {
    paymentStatus = "PENDING";
  }

  const maxToday = await db.appointment.findFirst({
    where: {
      doctorId: data.doctorId,
      appointmentDate: {
        gte: startOfDay(appointmentDate),
        lte: endOfDay(appointmentDate),
      },
      status: {
        not: AppointmentStatus.CANCELLED,
      },
    },
    orderBy: { serialNumber: "desc" },
  });

  const serial = (maxToday?.serialNumber ?? 0) + 1;

  const linkedPreviousVisitId =
    calculatedFee.previousPrescriptionId ||
    data.previousPrescriptionId ||
    null;

  const isStaffOrDoctor =
    authUser?.role === RoleName.STAFF ||
    authUser?.role === RoleName.SUPER_ADMIN ||
    authUser?.role === RoleName.ADMIN ||
    authUser?.role === RoleName.DOCTOR;

  const initialStatus = isStaffOrDoctor
    ? AppointmentStatus.CONFIRMED
    : AppointmentStatus.PENDING;

  const verifiedAt = isStaffOrDoctor ? new Date() : null;
  const verifiedBy = isStaffOrDoctor ? `Clinic Front Desk (${authUser?.role || "Staff"})` : null;
  const verificationNotes = isStaffOrDoctor
    ? "Verified and confirmed directly by clinic staff upon check-in"
    : null;

  const appointment = await db.appointment.create({
    data: {
      doctorId: data.doctorId,
      patientId: finalPatientId,
      organizationId: orgId,
      appointmentDate,
      serialNumber: serial,
      notes: data.notes,
      visitType,
      fee: finalFee,
      paymentStatus,
      paymentMethod,
      stripeSessionId: data.stripeSessionId,
      stripePaymentIntentId: data.stripePaymentIntentId,
      previousPrescriptionId: linkedPreviousVisitId,
      diseasesJson: data.diseases,
      allergiesJson: data.allergies,
      medicalFlagsJson: data.medicalFlags,
      dietRequired: data.dietRequired ?? false,
      dietInstructionsJson: data.dietInstructions,
      dietNotes: data.dietNotes,
      status: initialStatus,
      verifiedAt,
      verifiedBy,
      verificationNotes,
    },
    include: appointmentInclude,
  });

  // Handle Stripe Checkout Session generation when online payment is selected and fee > 0
  let stripeCheckoutUrl: string | null = null;
  let stripeSessionId: string | null = null;
  let isRealStripe = false;

  if (paymentMethod === "STRIPE" && finalFee > 0) {
    const stripe = getStripeServer();
    const origin = requestOrigin || "http://localhost:3000";

    if (stripe && isStripeConfigured()) {
      try {
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Doctor Consultation - ${doctorRec.user.name}`,
                  description: `${
                    visitType === "FOLLOWUP" ? "Follow-up Consultation" : "New Patient Visit"
                  } • Serial #${serial}`,
                },
                unit_amount: Math.round(finalFee * 100),
              },
              quantity: 1,
            },
          ],
          metadata: {
            type: "APPOINTMENT_FEE",
            appointmentId: appointment.id,
            doctorId: data.doctorId,
            patientId: finalPatientId,
          },
          success_url: `${origin}/dashboard/patient?tab=overview&paid=true&appointment_id=${appointment.id}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/dashboard/patient?tab=overview&canceled=true&appointment_id=${appointment.id}`,
        });

        stripeCheckoutUrl = session.url;
        stripeSessionId = session.id;
        isRealStripe = true;

        await db.appointment.update({
          where: { id: appointment.id },
          data: { stripeSessionId },
        });
      } catch (stripeErr) {
        console.error("Failed to generate Stripe checkout for appointment:", stripeErr);
      }
    }

    // In Demo / Sandbox mode without Stripe API keys configured in .env:
    if (!stripeCheckoutUrl) {
      stripeCheckoutUrl = `${origin}/checkout/stripe-demo?appointmentId=${appointment.id}&fee=${finalFee}&doctor=${encodeURIComponent(
        doctorRec.user.name
      )}&serial=${serial}&visitType=${visitType}`;
    }
  }

  return {
    ...appointment,
    stripeCheckoutUrl,
    stripeSessionId,
    isRealStripe,
    feeCalculation: calculatedFee,
  };
}

export async function confirmAppointment(
  id: string,
  user: { role: RoleName; userId: string; name?: string },
  notes?: string
) {
  if (user.role === RoleName.PATIENT) {
    throw new AppError("Unauthorized: Patients cannot confirm appointments. Only clinic staff or doctors can confirm.", 403);
  }

  const existing = await db.appointment.findUnique({
    where: { id },
    include: appointmentInclude,
  });

  if (!existing) {
    throw new AppError("Appointment not found", 404);
  }

  if (existing.status === AppointmentStatus.CANCELLED) {
    throw new AppError("Cannot confirm a cancelled appointment", 400);
  }

  return db.appointment.update({
    where: { id },
    data: {
      status: AppointmentStatus.CONFIRMED,
      verifiedAt: new Date(),
      verifiedBy: user.name || `Clinic Staff (${user.role})`,
      verificationNotes: notes || "Doctor availability, timing, and payment verified by clinic staff.",
    },
    include: appointmentInclude,
  });
}

export async function cancelAppointment(
  id: string,
  user: { role: RoleName; userId: string; name?: string },
  input?: {
    reason?: string;
    refundChoice?: "FULL" | "NONE" | "CUSTOM";
    refundAmount?: number;
  }
) {
  const existing = await db.appointment.findUnique({
    where: { id },
    include: appointmentInclude,
  });

  if (!existing) {
    throw new AppError("Appointment not found", 404);
  }

  if (existing.status === AppointmentStatus.CANCELLED) {
    throw new AppError("Appointment is already cancelled", 400);
  }

  if (existing.status === AppointmentStatus.COMPLETED) {
    throw new AppError("Cannot cancel an already completed consultation", 400);
  }

  const now = new Date();
  const appointmentTime = new Date(existing.appointmentDate);
  const cutoffHours = existing.doctor.cancellationWindowHours ?? 24;
  const hoursUntilAppointment =
    (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  let refundStatus = existing.refundStatus || "NONE";
  let refundAmount = existing.refundAmount || 0;
  let refundReason = existing.refundReason || null;

  // 1. Patient cancellation path: enforce strict advance cancellation cutoff
  if (user.role === RoleName.PATIENT) {
    if (existing.patient.userId !== user.userId) {
      throw new AppError("Unauthorized access to appointment", 403);
    }

    if (hoursUntilAppointment < cutoffHours) {
      const remainingFriendly =
        hoursUntilAppointment > 0
          ? `${Math.max(1, Math.round(hoursUntilAppointment))} hour(s)`
          : "past scheduled time";
      throw new AppError(
        `Cancellation window closed: Per clinic policy, appointments can only be cancelled at least ${cutoffHours} hours in advance. (${remainingFriendly} remaining). Please contact the clinic front desk for assistance.`,
        400
      );
    }

    // Patient cancelled before cutoff -> eligible for 100% full refund if fee was paid
    const wasPaid = existing.paymentStatus === "PAID" && (existing.fee ?? 0) > 0;
    if (wasPaid) {
      refundStatus = "REFUNDED";
      refundAmount = existing.fee ?? 0;
      refundReason = `Eligible for full refund: Patient cancelled ${Math.round(hoursUntilAppointment)}h before appointment (> ${cutoffHours}h threshold)`;

      // If Stripe payment intent exists, attempt automatic refund
      if (existing.stripePaymentIntentId) {
        const stripe = getStripeServer();
        if (stripe && isStripeConfigured()) {
          try {
            await stripe.refunds.create({
              payment_intent: existing.stripePaymentIntentId,
              reason: "requested_by_customer",
            });
          } catch (stripeErr) {
            console.error("Stripe auto-refund attempt error:", stripeErr);
          }
        }
      }
    } else {
      refundStatus = "NOT_APPLICABLE";
    }

    return db.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancellationReason: input?.reason?.trim() || "Patient cancelled appointment within allowable window",
        cancelledAt: new Date(),
        cancelledByRole: "PATIENT",
        refundStatus,
        refundAmount,
        refundReason,
      },
      include: appointmentInclude,
    });
  }

  // 2. Staff / Admin / Doctor cancellation: Clinic staff has administrative override
  const isRefundEligible = existing.paymentStatus === "PAID" && (existing.fee ?? 0) > 0;
  if (isRefundEligible) {
    if (input?.refundChoice === "NONE") {
      refundStatus = "REJECTED";
      refundAmount = 0;
      refundReason = input?.reason?.trim() || "Refund waived / not issued by clinic staff";
    } else {
      refundStatus = "REFUNDED";
      refundAmount =
        input?.refundChoice === "CUSTOM" && input?.refundAmount !== undefined
          ? input.refundAmount
          : existing.fee ?? 0;
      refundReason = input?.reason?.trim() || `Full refund issued by clinic staff (${user.role})`;

      if (existing.stripePaymentIntentId) {
        const stripe = getStripeServer();
        if (stripe && isStripeConfigured()) {
          try {
            await stripe.refunds.create({
              payment_intent: existing.stripePaymentIntentId,
              reason: "requested_by_customer",
            });
          } catch (stripeErr) {
            console.error("Stripe refund attempt error:", stripeErr);
          }
        }
      }
    }
  } else {
    refundStatus = "NOT_APPLICABLE";
  }

  return db.appointment.update({
    where: { id },
    data: {
      status: AppointmentStatus.CANCELLED,
      cancellationReason: input?.reason?.trim() || `Cancelled by ${user.role} (${user.name || "Staff"})`,
      cancelledAt: new Date(),
      cancelledByRole: user.role,
      refundStatus,
      refundAmount,
      refundReason,
    },
    include: appointmentInclude,
  });
}

export async function updateAppointment(
  id: string,
  input: unknown,
  user?: { role: RoleName; userId: string; name?: string }
) {
  const data = appointmentUpdateSchema.parse(input);

  const existing = await db.appointment.findUnique({
    where: { id },
    include: appointmentInclude,
  });
  if (!existing) {
    throw new AppError("Appointment not found", 404);
  }

  // If status is being transitioned to CANCELLED and user is provided, run cancel flow
  if (data.status === AppointmentStatus.CANCELLED && user) {
    return cancelAppointment(id, user, {
      reason: data.cancellationReason || data.notes,
      refundAmount: data.refundAmount,
    });
  }

  // If status is being transitioned to CONFIRMED and user is provided
  if (data.status === AppointmentStatus.CONFIRMED && user) {
    return confirmAppointment(id, user, data.verificationNotes || undefined);
  }

  return db.appointment.update({
    where: { id },
    data: {
      ...(data.status ? { status: data.status } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.paymentStatus ? { paymentStatus: data.paymentStatus } : {}),
      ...(data.paymentMethod ? { paymentMethod: data.paymentMethod } : {}),
      ...(data.refundStatus ? { refundStatus: data.refundStatus } : {}),
      ...(data.refundAmount !== undefined ? { refundAmount: data.refundAmount } : {}),
      ...(data.refundReason !== undefined ? { refundReason: data.refundReason } : {}),
      ...(data.cancellationReason !== undefined ? { cancellationReason: data.cancellationReason } : {}),
      ...(data.cancelledByRole !== undefined ? { cancelledByRole: data.cancelledByRole } : {}),
      ...(data.verifiedAt !== undefined ? { verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : null } : {}),
      ...(data.verifiedBy !== undefined ? { verifiedBy: data.verifiedBy } : {}),
      ...(data.verificationNotes !== undefined ? { verificationNotes: data.verificationNotes } : {}),
    },
    include: appointmentInclude,
  });
}

export async function deleteAppointment(id: string) {
  await db.appointment.delete({ where: { id } });
  return { deleted: true };
}
