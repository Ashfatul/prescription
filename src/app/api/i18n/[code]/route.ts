import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import {
  deleteTranslationLanguage,
  updateTranslationLanguage,
} from "@/features/translations/translation.service";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN]);
    const { code } = await context.params;
    return ok(await updateTranslationLanguage(code, await req.json()));
  });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN]);
    const { code } = await context.params;
    return ok(await deleteTranslationLanguage(code));
  });
}
