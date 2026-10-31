import { RoleName } from "@prisma/client";
import { redirect } from "next/navigation";
import { requirePageUser } from "@/lib/auth/page-auth";

export default async function DashboardPage() {
  const user = await requirePageUser();

  if (user.role.name === RoleName.SUPER_ADMIN || user.role.name === RoleName.STAFF) {
    redirect("/dashboard/admin");
  }

  if (user.role.name === RoleName.DOCTOR) {
    redirect("/dashboard/doctor");
  }

  redirect("/dashboard/patient");
}
