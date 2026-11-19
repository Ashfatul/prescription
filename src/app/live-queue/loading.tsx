import { Skeleton } from "@/components/common/skeleton";

export default function LiveQueueLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col">
      {/* Mock Header */}
      <div className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 flex items-center justify-between">
        <Skeleton className="w-36 h-7 rounded-lg" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-24 h-8 rounded-lg" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>

      {/* Main Queue Canvas */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div className="space-y-2">
            <Skeleton className="w-64 h-8 rounded-lg" />
            <Skeleton className="w-48 h-4 rounded-md" />
          </div>
          <Skeleton className="w-40 h-10 rounded-lg" />
        </div>

        {/* Chamber Queue Monitor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-5"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="w-32 h-4 rounded-md" />
                  <Skeleton className="w-20 h-3 rounded-md" />
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[var(--bg-subtle)] text-center space-y-2">
                <Skeleton className="w-20 h-3 mx-auto rounded-md" />
                <Skeleton className="w-16 h-10 mx-auto rounded-lg" />
              </div>
              <div className="space-y-2 pt-2">
                <Skeleton className="w-full h-8 rounded-lg" />
                <Skeleton className="w-full h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
