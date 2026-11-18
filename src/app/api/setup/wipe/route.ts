import { NextRequest, NextResponse } from "next/server";
import { wipeDatabaseForSetup, isSystemInstalled } from "@/features/setup/setup.service";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const installed = await isSystemInstalled();
    if (installed) {
      throw new AppError("System is already configured and locked.", 403);
    }

    await wipeDatabaseForSetup();

    return NextResponse.json({
      success: true,
      message: "Database operational tables wiped successfully.",
    });
  });
}
