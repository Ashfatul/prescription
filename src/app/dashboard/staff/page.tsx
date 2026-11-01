import { RoleName } from "@prisma/client";
import { requirePageUser } from "@/lib/auth/page-auth";
import { StaffDashboardView } from "@/components/dashboard/staff-dashboard-view";

export default async function StaffDashboardPage() {
  const user = await requirePageUser([RoleName.STAFF, RoleName.SUPER_ADMIN]);

  return <StaffDashboardView userId={user.id} />;
}
