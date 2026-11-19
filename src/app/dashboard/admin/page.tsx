import { RoleName } from "@prisma/client";
import { AdminDashboardView } from "@/components/dashboard/admin-dashboard-view";
import { requirePageUser } from "@/lib/auth/page-auth";
import { getDashboardStats } from "@/features/stats.service";
import { getRecentUsers } from "@/features/users/user.service";

export default async function AdminDashboardPage() {
  const user = await requirePageUser([RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.STAFF]);
  const orgId = user.role.name === RoleName.SUPER_ADMIN ? undefined : (user.organizationId || undefined);

  // Parallelize dashboard statistics and recent user roster queries concurrently
  const [stats, users] = await Promise.all([
    getDashboardStats(orgId),
    getRecentUsers(orgId, 9),
  ]);

  return <AdminDashboardView stats={stats} users={users} />;
}
