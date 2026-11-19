import { Skeleton } from "@/components/common/skeleton";

export default function DoctorsLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col">
      {/* Header bar placeholder */}
      <div className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 flex items-center justify-between">
        <Skeleton className="w-36 h-7 rounded-lg" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-24 h-8 rounded-lg" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>

      <main className="flex-1 w-full">
        {/* Hero Banner skeleton */}
        <div className="py-12 px-6 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] text-center space-y-4">
          <Skeleton className="w-72 h-9 mx-auto rounded-lg" />
          <Skeleton className="w-96 max-w-full h-4 mx-auto rounded-md" />
        </div>

        {/* Doctor Grid Skeleton */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {/* Filter strip skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between">
            <Skeleton className="w-full sm:w-72 h-10 rounded-lg" />
            <Skeleton className="w-full sm:w-48 h-10 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="w-32 h-5 rounded-md" />
                    <Skeleton className="w-24 h-3 rounded-md" />
                    <Skeleton className="w-28 h-3 rounded-md" />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg-subtle)] space-y-2">
                  <Skeleton className="w-full h-3 rounded-md" />
                  <Skeleton className="w-3/4 h-3 rounded-md" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="w-20 h-4 rounded-md" />
                  <Skeleton className="w-28 h-9 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
