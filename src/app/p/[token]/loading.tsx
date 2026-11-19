import { Skeleton, SkeletonText } from "@/components/common/skeleton";

export default function PublicPrescriptionLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Control Bar Skeleton */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <Skeleton className="w-32 h-6 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="w-24 h-9 rounded-lg" />
            <Skeleton className="w-24 h-9 rounded-lg" />
          </div>
        </div>

        {/* Prescription Paper Pad Container */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 sm:p-12 shadow-sm space-y-8">
          {/* Header Strip: Clinic & Doctor */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
            <div className="space-y-2">
              <Skeleton className="w-48 h-7 rounded-md" />
              <Skeleton className="w-64 h-4 rounded-md" />
              <Skeleton className="w-40 h-3.5 rounded-md" />
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="w-40 h-6 ml-auto rounded-md" />
              <Skeleton className="w-48 h-4 ml-auto rounded-md" />
              <Skeleton className="w-32 h-3.5 ml-auto rounded-md" />
            </div>
          </div>

          {/* Patient Info Bar */}
          <div className="p-4 rounded-lg bg-[var(--bg-subtle)] grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Skeleton className="w-full h-4 rounded-md" />
            <Skeleton className="w-full h-4 rounded-md" />
            <Skeleton className="w-full h-4 rounded-md" />
            <Skeleton className="w-full h-4 rounded-md" />
          </div>

          {/* Clinical Workspace: Rx & Advice Split */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            <div className="space-y-4">
              <Skeleton className="w-28 h-5 rounded-md" />
              <SkeletonText lines={4} />
            </div>
            <div className="md:col-span-2 space-y-5">
              <Skeleton className="w-36 h-6 rounded-md" />
              <div className="space-y-3">
                <Skeleton className="w-full h-14 rounded-lg" />
                <Skeleton className="w-full h-14 rounded-lg" />
                <Skeleton className="w-full h-14 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
