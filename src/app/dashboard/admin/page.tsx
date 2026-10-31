import { RoleName } from "@prisma/client";
import { AdminDashboardView } from "@/components/dashboard/admin-dashboard-view";
import { requirePageUser } from "@/lib/auth/page-auth";
import { getDashboardStats } from "@/features/stats.service";
import { listUsers } from "@/features/users/user.service";

export default async function AdminDashboardPage() {
  await requirePageUser([RoleName.SUPER_ADMIN, RoleName.STAFF]);
  const stats = await getDashboardStats();
  const users = await listUsers();

  return <AdminDashboardView stats={stats} users={users} />;
}
