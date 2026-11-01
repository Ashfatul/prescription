import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import {
  listOrganizations,
  createOrganization,
} from "@/features/organizations/organization.service";
import { RoleName } from "@prisma/client";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    // Super admin or public registration clinic list
    const orgs = await listOrganizations();
    return ok(orgs);
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req, [RoleName.SUPER_ADMIN]);
    const body = await req.json();

    if (!body.name || !body.slug) {
      throw new AppError("Name and slug are required", 400);
    }

    const org = await createOrganization(body, user.sub);
    return ok(org, 201);
  });
}
