import { RoleName } from "@prisma/client";
import { AdminDashboardView } from "@/components/dashboard/admin-dashboard-view";
import { requirePageUser } from "@/lib/auth/page-auth";
import { getDashboardStats } from "@/features/stats.service";
import { listUsers } from "@/features/users/user.service";

export default async function AdminDashboardPage() {
  const user = await requirePageUser([RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.STAFF]);
  const orgId = user.role.name === RoleName.SUPER_ADMIN ? undefined : (user.organizationId || undefined);
  const stats = await getDashboardStats(orgId);
  const users = await listUsers(orgId);

  return <AdminDashboardView stats={stats} users={users} />;
}
