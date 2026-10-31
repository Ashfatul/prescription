"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LanguageToggle } from "@/components/common/language-toggle";
import { ThemeCustomizer } from "@/components/common/theme-customizer";
import { useLanguage } from "@/lib/i18n/language-context";

export function Header({ loggedIn = false }: { loggedIn?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
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
          {!loggedIn && pathname !== "/auth/login" && (
            <Link
              className="rounded-xl bg-[var(--brand-primary)] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:opacity-90 transition-all"
              href="/auth/login"
            >
              {t.login}
            </Link>
          )}
          {loggedIn && (
            <>
              <Link
                className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs hover:opacity-90"
                href="/dashboard"
              >
                {t.dashboard}
              </Link>
              <button
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
