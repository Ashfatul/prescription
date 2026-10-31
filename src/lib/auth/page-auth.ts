import { RoleName } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCurrentUserFromCookie } from "@/lib/auth/session";

export async function requirePageUser(allowed?: RoleName[]) {
  const user = await getCurrentUserFromCookie();
  if (!user) {
    redirect("/auth/login");
  }

  if (allowed && !allowed.includes(user.role.name)) {
    redirect("/dashboard");
  }

  return user;
}
