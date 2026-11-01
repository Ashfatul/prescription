import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { createPrescription, listPrescriptions } from "@/features/prescriptions/prescription.service";
import { requireUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const queryOrgId = searchParams.get("organizationId");
    const orgId = auth.organizationId || (auth.role === "SUPER_ADMIN" ? queryOrgId : undefined);
    return ok(await listPrescriptions({ role: auth.role, userId: auth.sub, organizationId: orgId }));
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    await requireUser(req);
    return ok(await createPrescription(await req.json()), 201);
  });
}
