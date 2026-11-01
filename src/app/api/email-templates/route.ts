import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import {
  listEmailTemplates,
  createEmailTemplate,
} from "@/features/email-templates/email-template.service";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.ADMIN]);
    const { searchParams } = new URL(req.url);
    const orgId = user.role === RoleName.SUPER_ADMIN ? (searchParams.get("organizationId") || undefined) : user.organizationId;
    return ok(await listEmailTemplates(orgId || undefined));
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req, [RoleName.SUPER_ADMIN]);
    const body = await req.json();
    return ok(await createEmailTemplate(body, user.sub), 201);
  });
}
