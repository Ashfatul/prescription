import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { performManualDemoReset } from "@/features/demo/demo-reset.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const res = await performManualDemoReset();
    return ok(res);
  });
}
