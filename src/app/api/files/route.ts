import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { listFiles } from "@/features/files/file.service";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);
    return ok(await listFiles(auth.sub));
  });
}
