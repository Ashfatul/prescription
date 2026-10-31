import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requirePageUser } from "@/lib/auth/page-auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser();

  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center text-slate-400">Loading clinical workspace...</div>}>
      <DashboardShell user={user}>
        {children}
      </DashboardShell>
    </Suspense>
  );
}
