import { Skeleton, SkeletonText } from "@/components/common/skeleton";

export default function PrescriptionPrintLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] py-8 px-4 flex justify-center">
      <div className="w-full max-w-[210mm] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-8 sm:p-12 shadow-sm space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[var(--border-subtle)]">
          <div className="space-y-2">
            <Skeleton className="w-48 h-6 rounded-md" />
            <Skeleton className="w-64 h-3.5 rounded-md" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="w-40 h-5 ml-auto rounded-md" />
            <Skeleton className="w-32 h-3.5 ml-auto rounded-md" />
          </div>
        </div>

        {/* Patient Bar */}
        <div className="p-3.5 rounded-lg bg-[var(--bg-subtle)] grid grid-cols-4 gap-4">
          <Skeleton className="w-full h-3.5 rounded-md" />
          <Skeleton className="w-full h-3.5 rounded-md" />
          <Skeleton className="w-full h-3.5 rounded-md" />
          <Skeleton className="w-full h-3.5 rounded-md" />
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-3 gap-6 pt-4 min-h-[400px]">
          <div className="space-y-4">
            <Skeleton className="w-24 h-4 rounded-md" />
            <SkeletonText lines={5} />
          </div>
          <div className="col-span-2 space-y-4">
            <Skeleton className="w-32 h-5 rounded-md" />
            <Skeleton className="w-full h-12 rounded-lg" />
            <Skeleton className="w-full h-12 rounded-lg" />
            <Skeleton className="w-full h-12 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
