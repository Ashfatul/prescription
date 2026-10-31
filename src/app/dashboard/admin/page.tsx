import { RoleName } from "@prisma/client";
import { StatCard } from "@/components/common/stat-card";
import { Card } from "@/components/common/card";
import { TemplateManager } from "@/components/dashboard/template-manager";
import { requirePageUser } from "@/lib/auth/page-auth";
import { getDashboardStats } from "@/features/stats.service";
import { listUsers } from "@/features/users/user.service";

export default async function AdminDashboardPage() {
  await requirePageUser([RoleName.SUPER_ADMIN, RoleName.STAFF]);
  const stats = await getDashboardStats();
  const users = await listUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            System Administration
          </h1>
          <p className="text-xs text-zinc-500">
            Manage system-wide metrics, users, and hospital prescription templates.
          </p>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Users" value={stats.users} />
        <StatCard label="Doctors" value={stats.doctors} />
        <StatCard label="Patients" value={stats.patients} />
        <StatCard label="Appointments" value={stats.appointments} />
        <StatCard label="Prescriptions" value={stats.prescriptions} />
      </div>

      {/* Main Prescription Templates Section */}
      <TemplateManager />

      {/* Recent Users List */}
      <Card>
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">User Directory</h2>
          <span className="text-xs text-zinc-500">{users.length} registered accounts</span>
        </div>
        <div className="mt-3 space-y-2">
          {users.slice(0, 8).map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-xl bg-zinc-50 px-3.5 py-2.5 text-sm transition hover:bg-zinc-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80"
            >
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</span>
                <span className="ml-2 text-xs text-zinc-500">{user.email}</span>
              </div>
              <span className="rounded-md bg-zinc-200/70 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {user.role.name}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
