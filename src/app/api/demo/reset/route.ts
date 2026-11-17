import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    throw new AppError("Demo reset is permanently disabled in this installation.", 403);
  });
}
