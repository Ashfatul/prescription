import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import { RoleName } from "@prisma/client";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { db } from "@/lib/db";
import {
  getClinicSubscription,
  processStripeSandboxUpgrade,
} from "@/features/subscription/subscription.service";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const requestedOrgId = searchParams.get("organizationId");

    let orgId = auth.organizationId;
    if (auth.role === RoleName.SUPER_ADMIN && requestedOrgId) {
      orgId = requestedOrgId;
    }

    if (!orgId) {
      // If root platform admin without specific org, get first org or return null
      const firstOrg = await db.organization.findFirst({
        orderBy: { createdAt: "asc" },
      });
      if (firstOrg) {
        orgId = firstOrg.id;
      } else {
        throw new AppError("No organization found to inspect subscription", 404);
      }
    }

    const subscription = await getClinicSubscription(orgId);
    return ok(subscription);
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.ADMIN]);
    const body = await req.json();

    let targetOrgId = auth.organizationId;
    if (auth.role === RoleName.SUPER_ADMIN && body.organizationId) {
      targetOrgId = body.organizationId;
    }

    if (auth.role === RoleName.ADMIN && body.organizationId && body.organizationId !== auth.organizationId) {
      throw new AppError("Clinic administrators can only upgrade their own clinic.", 403);
    }

    if (!targetOrgId) {
      throw new AppError("Organization ID is required for upgrade", 400);
    }

    if (!body.planId) {
      throw new AppError("Pricing plan selection is required", 400);
    }

    if (!body.cardNumber || !body.expiry || !body.cvc) {
      throw new AppError("Card number, expiry, and CVC are required for Stripe Sandbox payment", 400);
    }

    const result = await processStripeSandboxUpgrade({
      organizationId: targetOrgId,
      planId: body.planId,
      cardHolder: body.cardHolder || "Clinic Administrator",
      cardNumber: body.cardNumber,
      expiry: body.expiry,
      cvc: body.cvc,
      userId: auth.sub,
      userName: body.cardHolder || "Clinic Administrator",
    });

    return ok(result);
  });
}
