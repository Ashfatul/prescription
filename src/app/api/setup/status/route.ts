import { NextRequest, NextResponse } from "next/server";
import { getSystemSetupStatus } from "@/features/setup/setup.service";
import { withErrorHandling } from "@/lib/api-handler";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const status = await getSystemSetupStatus();
    return NextResponse.json({
      success: true,
      data: status,
    });
  });
}
