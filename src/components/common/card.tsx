import { clsx } from "clsx";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-[var(--bg-surface)] p-6 shadow-sm transition-all",
        className
      )}
    >
      {children}
    </div>
  );
}
