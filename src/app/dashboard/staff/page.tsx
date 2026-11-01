import { RoleName } from "@prisma/client";
import { requirePageUser } from "@/lib/auth/page-auth";
import { ReceptionManager } from "@/components/dashboard/reception-manager";

export default async function StaffDashboardPage() {
  await requirePageUser([RoleName.STAFF, RoleName.SUPER_ADMIN]);

  return <ReceptionManager />;
}
