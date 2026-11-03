"use client";

import { useEffect, useState } from "react";
import {
  Code,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  X,
} from "lucide-react";
import { CustomSelect } from "@/components/common/custom-select";
import { useLanguage } from "@/lib/i18n/language-context";

type ActivityLogItem = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  detailsJson?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export function ActivityLogViewer() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null);

  const fetchLogs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter !== "ALL") params.set("role", roleFilter);
    if (actionFilter !== "ALL") params.set("action", actionFilter);
    params.set("limit", "100");

    fetch(`/api/activity-logs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setLogs(data.data.items || []);
          setTotal(data.data.total || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter !== "ALL") params.set("role", roleFilter);
    if (actionFilter !== "ALL") params.set("action", actionFilter);
    params.set("limit", "100");

    fetch(`/api/activity-logs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.data) {
          setLogs(data.data.items || []);
          setTotal(data.data.total || 0);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [roleFilter, actionFilter, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const getActionBadge = (action: string) => {
    if (action.includes("LOGIN")) {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-[10px] font-mono">
          {action}
        </span>
      );
    }
    if (action.includes("PRESCRIPTION")) {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-[10px] font-mono">
          {action}
        </span>
      );
    }
    if (action.includes("REGISTER") || action.includes("CREATE")) {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] font-mono">
          {action}
        </span>
      );
    }
    if (action.includes("DELETE") || action.includes("DISABLE")) {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px] font-mono">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg bg-slate-500/10 text-slate-700 dark:text-slate-300 font-bold text-[10px] font-mono">
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {t.systemActivityAuditLog}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              {t.systemActivitySubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-bold text-slate-600 dark:text-slate-400">
              {t.totalRecorded} <strong>{total}</strong>
            </span>
            <button
              type="button"
              onClick={fetchLogs}
              className="p-2.5 rounded-xl border border-[var(--border-default)] text-slate-600 dark:text-slate-300 hover:bg-[var(--bg-subtle)] transition cursor-pointer"
              title="Refresh logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <form onSubmit={handleSearchSubmit} className="grid sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t.searchActivityPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full input-icon-left !pl-11 pr-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]"
            />
          </div>

          <div className="sm:col-span-3">
            <CustomSelect
              value={roleFilter}
              onChange={(val) => setRoleFilter(val)}
              options={[
                { value: "ALL", label: t.allRoles },
                { value: "SUPER_ADMIN", label: "Super Admin" },
                { value: "DOCTOR", label: "Doctor" },
                { value: "STAFF", label: "Staff" },
                { value: "PATIENT", label: "Patient" },
              ]}
              searchable={false}
            />
          </div>

          <div className="sm:col-span-3">
            <CustomSelect
              value={actionFilter}
              onChange={(val) => setActionFilter(val)}
              options={[
                { value: "ALL", label: t.allEventTypes },
                { value: "USER_LOGIN", label: "User Logins" },
                { value: "PRESCRIPTION_CREATED", label: "Prescription Created" },
                { value: "PATIENT_REGISTERED", label: "Patient Registrations" },
                { value: "DOCTOR_CREATED", label: "Doctor Accounts Added" },
                { value: "STAFF_CREATED", label: "Staff Accounts Added" },
                { value: "TEST_REPORT_UPLOADED", label: "Test Report Uploads" },
                { value: "ANNOUNCEMENT_CREATED", label: "Announcements" },
              ]}
              searchable={false}
            />
          </div>
        </form>
      </div>

      {/* Logs Table / Cards */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--brand-primary)] mb-2" />
            <span>{t.loadingAuditLogEntries}</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            {t.noAuditRecordsMatch}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">{t.timestamp}</th>
                  <th className="py-3.5 px-4">{t.actionEvent}</th>
                  <th className="py-3.5 px-4">{t.actorAndRole}</th>
                  <th className="py-3.5 px-4">{t.entity}</th>
                  <th className="py-3.5 px-4">{t.clinicOrOrganization}</th>
                  <th className="py-3.5 px-4 text-right">{t.viewDetails}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-[var(--bg-subtle)]/40 transition group"
                  >
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {log.userName || "System"}
                        </span>
                        {log.userRole && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-[var(--bg-subtle)] text-slate-500">
                            {log.userRole}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {log.entityType}
                      </span>
                      {log.entityId && (
                        <span className="font-mono text-[10px] text-slate-400 block">
                          #{log.entityId.slice(-8)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {log.organization?.name || "Global / System"}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {log.detailsJson ? (
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--brand-surface)] text-[var(--brand-text)] font-semibold text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Code className="w-3 h-3" />
                          <span>{t.inspect}</span>
                        </button>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details JSON Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
            <div className="modal-header shrink-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {t.eventMetadataPayload}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedLog.action} • {new Date(selectedLog.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body flex-1 overflow-y-auto p-6 space-y-4">
              <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-80 border border-slate-800">
                {JSON.stringify(selectedLog.detailsJson, null, 2)}
              </pre>
            </div>

            <div className="modal-footer shrink-0 flex items-center justify-end px-6 py-4 border-t border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold cursor-pointer hover:opacity-90 transition shadow-xs"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
