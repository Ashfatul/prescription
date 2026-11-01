import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import {
  updateTestReport,
  deleteTestReport,
} from "@/features/test-reports/test-report.service";
import { ok } from "@/lib/http";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    await requireUser(req);
    const { id } = await context.params;
    const body = await req.json();

    const updated = await updateTestReport(id, body);
    return ok(updated);
  });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    await requireUser(req);
    const { id } = await context.params;

    await deleteTestReport(id);
    return ok({ success: true });
  });
}
