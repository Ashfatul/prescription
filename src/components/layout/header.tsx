"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/common/language-toggle";
import { ThemeCustomizer } from "@/components/common/theme-customizer";
import { useLanguage } from "@/lib/i18n/language-context";
import { useAuth } from "@/lib/auth/auth-context";

export function Header({ loggedIn }: { loggedIn?: boolean }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, logout, loading } = useAuth();

  const isLoggedIn = loggedIn !== undefined ? loggedIn : !!user;

  const onLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[var(--bg-surface)]/85 backdrop-blur-md dark:border-slate-800/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center font-black text-sm shadow-xs">
            Rx
          </div>
          <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base">
            PPMS <span className="text-[var(--brand-text)] font-semibold text-xs">Clinical</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2.5">
          <ThemeCustomizer compact />
          <LanguageToggle />

          {/* User profile pill when authenticated */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-xs shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse" />
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                {user.name}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)]">
                {user.role}
              </span>
            </div>
          )}

          {!isLoggedIn && !loading && pathname !== "/auth/login" && (
            <Link
              className="rounded-xl bg-[var(--brand-primary)] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:opacity-90 transition-all cursor-pointer"
              href="/auth/login"
            >
              {t.login}
            </Link>
          )}

          {isLoggedIn && (
            <>
              <Link
                className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs hover:opacity-90 transition-all"
                href="/dashboard"
              >
                {t.dashboard}
              </Link>
              <button
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                onClick={onLogout}
                type="button"
              >
                {t.logout}
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
