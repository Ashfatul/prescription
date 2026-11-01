import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import {
  getEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from "@/features/email-templates/email-template.service";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.ADMIN]);
    const { id } = await context.params;
    const template = await getEmailTemplate(id);
    if (!template) throw new AppError("Email template not found", 404);
    return ok(template);
  });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req, [RoleName.SUPER_ADMIN]);
    const { id } = await context.params;
    const body = await req.json();
    return ok(await updateEmailTemplate(id, body, user.sub));
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req, [RoleName.SUPER_ADMIN]);
    const { id } = await context.params;
    return ok(await deleteEmailTemplate(id, user.sub));
  });
}
