import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import {
  createTranslationLanguage,
  getTranslationBundle,
  getTranslationCatalog,
} from "@/features/translations/translation.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const { searchParams } = new URL(req.url);
    return ok(await getTranslationBundle(searchParams.get("language") || "en"));
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN]);
    return ok(await createTranslationLanguage(await req.json()), 201);
  });
}

export async function HEAD(req: NextRequest) {
  return withErrorHandling(req, async () => ok(await getTranslationCatalog()));
}
