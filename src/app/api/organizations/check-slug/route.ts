import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { validateSlugAvailability } from "@/features/organizations/organization.service";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const { searchParams } = new URL(req.url);
    const rawSlug = searchParams.get("slug");

    if (!rawSlug || !rawSlug.trim()) {
      throw new AppError("Subdomain slug query parameter is required.", 400);
    }

    const result = await validateSlugAvailability(rawSlug);
    return ok(result);
  });
}
