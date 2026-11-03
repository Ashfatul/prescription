import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requirePageUser } from "@/lib/auth/page-auth";
import { LoadingFallback } from "@/components/common/loading-fallback";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <DashboardShell user={user}>
        {children}
      </DashboardShell>
    </Suspense>
  );
}
