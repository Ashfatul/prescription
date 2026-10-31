import { RoleName } from "@prisma/client";
import { StatCard } from "@/components/common/stat-card";
import { Card } from "@/components/common/card";
import { requirePageUser } from "@/lib/auth/page-auth";
import { getDashboardStats } from "@/features/stats.service";
import { listUsers } from "@/features/users/user.service";

export default async function AdminDashboardPage() {
  await requirePageUser([RoleName.SUPER_ADMIN, RoleName.STAFF]);
  const stats = await getDashboardStats();
  const users = await listUsers();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Users" value={stats.users} />
        <StatCard label="Doctors" value={stats.doctors} />
        <StatCard label="Patients" value={stats.patients} />
        <StatCard label="Appointments" value={stats.appointments} />
        <StatCard label="Prescriptions" value={stats.prescriptions} />
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Recent Users</h2>
        <div className="space-y-2">
          {users.slice(0, 8).map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800">
              <span>{user.name}</span>
              <span>{user.email}</span>
              <span>{user.role.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
