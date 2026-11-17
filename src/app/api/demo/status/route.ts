import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    return ok({
      isDemoMode: false,
      nextResetTime: null,
      message: "Demo mode has been disabled.",
    });
  });
}
