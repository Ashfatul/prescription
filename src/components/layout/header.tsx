"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LanguageToggle } from "@/components/common/language-toggle";
import { ThemeToggle } from "@/components/common/theme-toggle";
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
    <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight text-teal-700 dark:text-teal-300">
          PPMS
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
          {!loggedIn && pathname !== "/auth/login" && (
            <Link className="rounded-lg bg-teal-600 px-3 py-1 text-sm text-white" href="/auth/login">
              {t.login}
            </Link>
          )}
          {loggedIn && (
            <>
              <Link className="rounded-lg bg-zinc-900 px-3 py-1 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900" href="/dashboard">
                {t.dashboard}
              </Link>
              <button
                className="rounded-lg border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
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
