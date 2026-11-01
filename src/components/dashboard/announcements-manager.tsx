"use client";

import { useEffect, useState } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { CustomSelect } from "@/components/common/custom-select";

type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  targetRole: string;
  priority: string;
  authorName: string;
  isActive: boolean;
  createdAt: string;
};

export function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState("ALL");
  const [priority, setPriority] = useState("NORMAL");

  const fetchAnnouncements = () => {
    setLoading(true);
    fetch("/api/announcements?includeInactive=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setAnnouncements(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let isMounted = true;
    fetch("/api/announcements?includeInactive=true")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data)) {
          setAnnouncements(data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          targetRole,
          priority,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setTitle("");
        setContent("");
        fetchAnnouncements();
      } else {
        setError(data.message || "Failed to post announcement.");
      }
    } catch {
      setError("Network error creating announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      await fetch(`/api/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentState }),
      });
      fetchAnnouncements();
    } catch {
      // Ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this announcement?")) return;
    try {
      await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // Ignore
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "URGENT":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
      case "HIGH":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      default:
        return "bg-teal-500/10 text-teal-600 dark:text-teal-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Hospital Announcements & Broadcasts
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Send targeted alerts to Doctors, Patients, Staff, or broadcast hospital-wide updates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Broadcast</span>
        </button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--brand-primary)] mb-2" />
          <span>Loading announcements...</span>
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-slate-400">
          No announcements created yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {announcements.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-3xl bg-[var(--bg-surface)] border transition flex flex-col justify-between space-y-4 shadow-xs ${
                item.isActive
                  ? "border-[var(--border-subtle)] hover:border-[var(--brand-border)]"
                  : "border-dashed opacity-60"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${getPriorityBadge(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      Audience: {item.targetRole}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold ${
                      item.isActive ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {item.isActive ? "Active Live" : "Inactive"}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-slate-500">
                <span>By {item.authorName} • {new Date(item.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item.id, item.isActive)}
                    className="px-2.5 py-1 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    {item.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Create Hospital Broadcast
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                  Broadcast Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled Maintenance / New OPD Visiting Hours"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Target Audience
                  </label>
                  <CustomSelect
                    value={targetRole}
                    onChange={(val) => setTargetRole(val)}
                    options={[
                      { value: "ALL", label: "All Users (Public)" },
                      { value: "DOCTOR", label: "Physicians & Doctors Only" },
                      { value: "PATIENT", label: "Patients Only" },
                      { value: "STAFF", label: "Front Desk & Staff Only" },
                    ]}
                    searchable={false}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Urgency Priority
                  </label>
                  <CustomSelect
                    value={priority}
                    onChange={(val) => setPriority(val)}
                    options={[
                      { value: "NORMAL", label: "Normal (Info)" },
                      { value: "HIGH", label: "High Priority" },
                      { value: "URGENT", label: "Urgent / Critical Action" },
                    ]}
                    searchable={false}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                  Announcement Details *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write clear instructions or notice information..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-default)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[var(--brand-primary)] text-white font-bold"
                >
                  {submitting ? "Publishing..." : "Broadcast Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
