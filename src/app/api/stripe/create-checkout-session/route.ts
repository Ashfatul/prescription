import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/session";
import { RoleName } from "@prisma/client";
import { getStripeServer, isStripeConfigured } from "@/lib/stripe/stripe";

export async function POST(req: NextRequest) {
    return withErrorHandling(req, async () => {
        const auth = await requireUser(req, [
            RoleName.SUPER_ADMIN,
            RoleName.ADMIN,
        ]);
        const body = await req.json();

        const planId = body.planId;
        let organizationId = body.organizationId || auth.organizationId;

        if (!planId) {
            throw new AppError(
                "Plan ID is required to initiate Stripe payment.",
                400,
            );
        }

        if (!organizationId) {
            const defaultOrg = await db.organization.findFirst({
                where: { status: { in: ["ACTIVE", "TRIAL"] } },
            });
            if (!defaultOrg) {
                throw new AppError(
                    "No organization associated with this account.",
                    400,
                );
            }
            organizationId = defaultOrg.id;
        }

        const [org, plan, user] = await Promise.all([
            db.organization.findUnique({ where: { id: organizationId } }),
            db.pricingPlan.findUnique({ where: { id: planId } }),
            db.user.findUnique({
                where: { id: auth.sub },
                select: { id: true, email: true, name: true },
            }),
        ]);

        if (!org) {
            throw new AppError("Organization not found.", 404);
        }
        if (!plan) {
            throw new AppError("Pricing plan not found.", 404);
        }

        const host = req.headers.get("host") || "localhost:3000";
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const origin = `${protocol}://${host}`;

        const stripe = getStripeServer();

        // 1. If valid Stripe secret key is present, create actual Stripe Checkout session
        if (stripe && isStripeConfigured()) {
            try {
                const session = await stripe.checkout.sessions.create({
                    mode: "subscription",
                    line_items: [
                        {
                            price_data: {
                                currency: "usd",
                                product_data: {
                                    name: `${plan.name} - CareFlow`,
                                    description:
                                        plan.description ||
                                        `SaaS subscription for ${org.name}`,
                                },
                                unit_amount: Math.round(plan.price * 100),
                                recurring: {
                                    interval: plan.billingCycle
                                        ?.toLowerCase()
                                        .includes("year")
                                        ? "year"
                                        : "month",
                                },
                            },
                            quantity: 1,
                        },
                    ],
                    customer_email:
                        user?.email || org.contactEmail || undefined,
                    client_reference_id: org.id,
                    metadata: {
                        organizationId: org.id,
                        planId: plan.id,
                        userId: auth.sub,
                    },
                    success_url: `${origin}/dashboard/admin?tab=billing&session_id={CHECKOUT_SESSION_ID}&success=true`,
                    cancel_url: `${origin}/dashboard/admin?tab=billing&canceled=true`,
                });

                return ok({
                    success: true,
                    isRealStripe: true,
                    url: session.url,
                    sessionId: session.id,
                });
            } catch (stripeErr: unknown) {
                const errObj = stripeErr as Error;
                console.error(
                    "Stripe Checkout Session Creation Error:",
                    errObj.message,
                );
                throw new AppError(`Stripe Error: ${errObj.message}`, 400);
            }
        }

        // 2. Fallback when STRIPE_SECRET_KEY is not configured yet
        return ok({
            success: true,
            isRealStripe: false,
            message:
                "Stripe API key is not configured in .env. To enable live/sandbox Stripe Checkout, set STRIPE_SECRET_KEY in your .env file.",
            plan: {
                id: plan.id,
                name: plan.name,
                price: plan.price,
            },
            organization: {
                id: org.id,
                name: org.name,
            },
        });
    });
}
