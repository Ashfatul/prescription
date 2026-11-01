import { RoleName } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { isEmailVerificationRequired } from "@/features/settings/settings.service";

export async function requirePageUser(allowed?: RoleName[]) {
  const user = await getCurrentUserFromCookie();
  if (!user) {
    redirect("/auth/login");
  }

  const requireVerification = await isEmailVerificationRequired();
  if (requireVerification && !user.emailVerified) {
    redirect(`/auth/verify-email?email=${encodeURIComponent(user.email)}`);
  }

  if (allowed && !allowed.includes(user.role.name)) {
    redirect("/dashboard");
  }

  return user;
}
