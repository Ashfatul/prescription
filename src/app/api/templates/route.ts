import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { templateService } from "@/features/templates/template.service";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    await requireUser(req);
    return ok(await templateService.list());
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.DOCTOR]);
    const body = await req.json();
    return ok(
      await templateService.create({
        ...body,
        createdById: auth.sub,
      }),
      201,
    );
  });
}
