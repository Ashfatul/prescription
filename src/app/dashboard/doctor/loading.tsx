import { Skeleton, SkeletonStatCard, SkeletonTable } from "@/components/common/skeleton";

export default function DoctorDashboardLoading() {
  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6">
      {/* Doctor Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <Skeleton className="w-14 h-14 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="w-48 sm:w-60 h-6 rounded-lg" />
            <Skeleton className="w-32 sm:w-44 h-4 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-28 h-10 rounded-lg" />
          <Skeleton className="w-36 h-10 rounded-lg" />
        </div>
      </div>

      {/* Doctor Tab Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border-subtle)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-lg shrink-0" />
        ))}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Main Workspace (Patient Queue / Recent Prescriptions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonTable rows={5} />
        </div>
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
            <Skeleton className="w-32 h-5 rounded-md" />
            <div className="space-y-3">
              <Skeleton className="w-full h-14 rounded-lg" />
              <Skeleton className="w-full h-14 rounded-lg" />
              <Skeleton className="w-full h-14 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
