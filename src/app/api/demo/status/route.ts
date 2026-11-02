import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { getDemoResetStatus } from "@/features/demo/demo-reset.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const status = await getDemoResetStatus();
    return ok(status);
  });
}
