"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  X,
  Loader2,
  Search,
  CheckCircle2,
  EyeOff,
} from "lucide-react";
import { CustomSelect } from "@/components/common/custom-select";
import { useAuth } from "@/lib/auth/auth-context";

const inputClasses =
  "w-full px-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]";
const textareaClasses =
  "w-full px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all resize-none";

export type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  targetRole: string;
  priority: string;
  authorName: string;
  isActive: boolean;
  createdAt: string;
};

export interface AnnouncementsManagerProps {
  canManage?: boolean;
  userRole?: string;
}

export function AnnouncementsManager({ canManage, userRole }: AnnouncementsManagerProps = {}) {
  const { user } = useAuth();
  const userRoleName =
    typeof user?.role === "string" ? user.role : (user?.role as { name?: string } | undefined)?.name;
  const currentRole = userRole || userRoleName || "PATIENT";
  const isManager =
    canManage !== undefined
      ? canManage
      : currentRole === "SUPER_ADMIN" || currentRole === "ADMIN" || currentRole === "STAFF";

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Modal
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
    const params = new URLSearchParams();
    if (isManager) {
      params.set("includeInactive", "true");
    }

    fetch(`/api/announcements?${params.toString()}`)
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
    const params = new URLSearchParams();
    if (isManager) {
      params.set("includeInactive", "true");
    }

    fetch(`/api/announcements?${params.toString()}`)
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
  }, [isManager]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          targetRole,
          priority,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setTitle("");
        setContent("");
        setTargetRole("ALL");
        setPriority("NORMAL");
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

  // Role filter options tailored to current viewer role
  const roleFilterOptions = useMemo(() => {
    if (currentRole === "SUPER_ADMIN" || currentRole === "STAFF") {
      return [
        { value: "ALL", label: "All Audiences" },
        { value: "DOCTOR", label: "Doctors & Physicians", badge: "Doctor" },
        { value: "PATIENT", label: "Patients & Public", badge: "Patient" },
        { value: "STAFF", label: "Hospital Front Desk", badge: "Staff" },
      ];
    }
    if (currentRole === "DOCTOR") {
      return [
        { value: "ALL", label: "All Visible Notices" },
        { value: "DOCTOR", label: "Doctor-Only Bulletins", badge: "Physicians" },
      ];
    }
    return [
      { value: "ALL", label: "All Visible Notices" },
      { value: "PATIENT", label: "Patient Care Notices", badge: "Patients" },
    ];
  }, [currentRole]);

  // Filtered list
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      // Status filter (for managers)
      if (statusFilter === "ACTIVE" && !item.isActive) return false;
      if (statusFilter === "INACTIVE" && item.isActive) return false;

      // Target role filter
      if (roleFilter !== "ALL" && item.targetRole !== roleFilter && item.targetRole !== "ALL") {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "ALL" && item.priority !== priorityFilter) {
        return false;
      }

      // Text search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesContent = item.content.toLowerCase().includes(query);
        const matchesAuthor = item.authorName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesContent && !matchesAuthor) return false;
      }

      return true;
    });
  }, [announcements, statusFilter, roleFilter, priorityFilter, searchTerm]);

  const urgentCount = useMemo(() => {
    return announcements.filter((a) => a.isActive && a.priority === "URGENT").length;
  }, [announcements]);

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "URGENT":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
      case "HIGH":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      default:
        return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold shadow-xs">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Hospital Bulletins & Announcements
                </h1>
                {urgentCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white shadow-2xs animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    {urgentCount} Urgent
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isManager
                  ? "Publish urgent notices, operational schedule updates, and clinical bulletins across the hospital network."
                  : "Review official hospital circulars, duty rosters, holiday schedules, and health bulletins."}
              </p>
            </div>
          </div>
        </div>

        {isManager && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:opacity-95 transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Broadcast</span>
          </button>
        )}
      </div>

      {/* Comprehensive Filter & Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by title, contents, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]"
          />
        </div>

        {/* Audience / Role Filter */}
        <div className="w-full md:w-56 shrink-0">
          <CustomSelect
            value={roleFilter}
            onChange={(val) => setRoleFilter(val)}
            options={roleFilterOptions}
            searchable={false}
            placeholder="Audience Role"
          />
        </div>

        {/* Priority Filter */}
        <div className="w-full md:w-48 shrink-0">
          <CustomSelect
            value={priorityFilter}
            onChange={(val) => setPriorityFilter(val)}
            options={[
              { value: "ALL", label: "All Priorities" },
              { value: "URGENT", label: "Urgent Only", badge: "Urgent" },
              { value: "HIGH", label: "High Priority", badge: "High" },
              { value: "NORMAL", label: "Normal (Info)" },
            ]}
            searchable={false}
            placeholder="Priority"
          />
        </div>

        {/* Manager Status Filter */}
        {isManager && (
          <div className="w-full md:w-44 shrink-0">
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: "ALL", label: "All Statuses" },
                { value: "ACTIVE", label: "Active Live", badge: "Live" },
                { value: "INACTIVE", label: "Deactivated" },
              ]}
              searchable={false}
              placeholder="Status"
            />
          </div>
        )}
      </div>

      {/* Announcements Feed */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
          <Loader2 className="w-7 h-7 animate-spin mx-auto text-[var(--brand-primary)]" />
          <p className="font-medium">Loading hospital bulletins and announcements...</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] text-slate-400 flex items-center justify-center mx-auto">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              No matching announcements found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || roleFilter !== "ALL" || priorityFilter !== "ALL"
                ? "Try clearing filters or search terms to view other bulletins."
                : "There are currently no active announcements for your department."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredAnnouncements.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-3xl bg-[var(--bg-surface)] border transition-all flex flex-col justify-between space-y-4 shadow-xs ${
                item.priority === "URGENT" && item.isActive
                  ? "border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-rose-500/5 via-[var(--bg-surface)] to-transparent"
                  : item.isActive
                  ? "border-[var(--border-subtle)] hover:border-[var(--brand-border)]"
                  : "border-dashed opacity-60 bg-[var(--bg-subtle)]/30"
              }`}
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${getPriorityBadge(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-[var(--bg-subtle)] text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-[var(--border-subtle)]">
                      Audience: {item.targetRole}
                    </span>
                  </div>

                  {isManager && (
                    <span
                      className={`text-[11px] font-bold inline-flex items-center gap-1 ${
                        item.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                      }`}
                    >
                      {item.isActive ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Active Live
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" /> Deactivated
                        </>
                      )}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>
                </div>
              </div>

              <div className="pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {item.authorName}
                  </span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                </div>

                {isManager && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item.id, item.isActive)}
                      className="px-3 py-1.5 rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer text-xs"
                    >
                      {item.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title="Permanently Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Create Hospital Broadcast
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold">
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
                  className={inputClasses}
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
                      { value: "ADMIN", label: "Clinic Administrators Only" },
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
                  className={textareaClasses}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-default)] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white font-bold shadow-xs hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-xs"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? "Publishing..." : "Publish Broadcast"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
