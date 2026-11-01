"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Sparkles, X } from "lucide-react";

type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  targetRole: string;
  priority: string;
  authorName: string;
  createdAt: string;
};

export function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setAnnouncements(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const visible = announcements.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  const current = visible[0];

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-200";
      case "HIGH":
        return "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-200";
      default:
        return "bg-teal-500/10 border-teal-500/20 text-teal-800 dark:text-teal-200";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-500 text-white";
      case "HIGH":
        return "bg-amber-500 text-white";
      default:
        return "bg-teal-600 text-white";
    }
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all flex items-start sm:items-center justify-between gap-3 text-xs mb-6 shadow-2xs ${getPriorityStyle(
        current.priority
      )}`}
    >
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 rounded-xl bg-white/60 dark:bg-black/20 shrink-0">
          {current.priority === "URGENT" ? (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          ) : (
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          )}
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${getPriorityBadge(
                current.priority
              )}`}
            >
              {current.priority}
            </span>
            <strong className="font-bold text-slate-900 dark:text-white">
              {current.title}
            </strong>
            <span className="text-[10px] opacity-70 hidden md:inline">
              • Broadcast from {current.authorName}
            </span>
          </div>
          <p className="opacity-90 leading-relaxed text-[11px] sm:text-xs">
            {current.content}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDismissed((prev) => [...prev, current.id])}
        className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition shrink-0 cursor-pointer"
        title="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
