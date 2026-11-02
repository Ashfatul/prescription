import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import { approveOrganization } from "@/features/organizations/organization.service";
import { RoleName } from "@prisma/client";
import { ok } from "@/lib/http";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req, [RoleName.SUPER_ADMIN]);
    const { id } = await context.params;

    const dbUser = await db.user.findUnique({ where: { id: user.sub } });
    const approvedBy = dbUser?.name || "Super Admin";

    const approvedOrg = await approveOrganization(id, approvedBy);
    return ok(approvedOrg);
  });
}
