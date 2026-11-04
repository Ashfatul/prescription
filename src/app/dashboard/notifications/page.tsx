"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/notifications", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!active) return;
        if (payload.success && payload.data) {
          setItems(payload.data.items || []);
          setUnreadCount(payload.data.unreadCount || 0);
        }
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setItems((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
    setUnreadCount((current) => Math.max(0, current - 1));
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
  };

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-primary)]">
            <Bell className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Notifications</h1>
            <p className="text-xs text-slate-500">All alerts for your account</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={() => void markAllRead()} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] px-3 py-2 text-xs font-bold text-slate-600 hover:bg-[var(--bg-subtle)] dark:text-slate-300">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </header>

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">Loading notifications...</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center text-sm text-slate-500">You are all caught up.</div>
      ) : (
        <div className="divide-y divide-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          {items.map((item) => (
            <article key={item.id} className={`flex items-start gap-4 p-4 ${item.read ? "" : "bg-[var(--brand-surface)]/40"}`}>
              <Bell className="mt-1 h-4 w-4 shrink-0 text-[var(--brand-primary)]" />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h2>
                  <time className="text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</time>
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{item.message}</p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {!item.read && <button type="button" onClick={() => void markRead(item.id)} className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--brand-text)]"><Check className="h-3 w-3" /> Mark read</button>}
                  {item.link && <Link href={item.link} onClick={() => { if (!item.read) void markRead(item.id); }} className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--brand-text)]">Open <ExternalLink className="h-3 w-3" /></Link>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
