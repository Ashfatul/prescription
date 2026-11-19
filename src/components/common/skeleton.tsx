import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800/80 rounded-lg ${className}`}
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 2,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          } rounded-md`}
        />
      ))}
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-xs flex flex-col justify-between h-32">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="w-7 h-7 rounded-lg" />
        <Skeleton className="w-12 h-3 rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-16 h-8 rounded-lg" />
        <Skeleton className="w-28 h-3 rounded-md" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
      {/* Table Header */}
      <div className="p-4 border-b border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-4">
        <Skeleton className="w-32 h-5 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-20 h-7 rounded-lg" />
          <Skeleton className="w-24 h-7 rounded-lg" />
        </div>
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-[var(--border-subtle)]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="w-36 h-4 rounded-md" />
                <Skeleton className="w-24 h-3 rounded-md" />
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              <Skeleton className="w-24 h-3.5 rounded-md" />
              <Skeleton className="w-20 h-6 rounded-full" />
            </div>
            <Skeleton className="w-16 h-7 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
