import { NextRequest, NextResponse } from "next/server";
import { executeSystemBootstrap, isSystemInstalled } from "@/features/setup/setup.service";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    // 1. Strict guard: if already installed, deny immediately
    const installed = await isSystemInstalled();
    if (installed) {
      throw new AppError("System is already configured and locked.", 403);
    }

    const body = await req.json();

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";

    const result = await executeSystemBootstrap({
      ...body,
      host,
      protocol,
    });

    return NextResponse.json({
      success: true,
      message: "System setup completed successfully.",
      data: result,
    });
  });
}
