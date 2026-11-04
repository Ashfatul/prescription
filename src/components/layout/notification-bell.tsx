"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  MessageSquare,
  Pill,
  Settings,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
};

type NotificationPreferences = {
  emailPrescriptionAlerts: boolean;
  systemPrescriptionAlerts: boolean;
  emailAppointmentReminders: boolean;
  systemAppointmentReminders: boolean;
  emailMedicineReminders: boolean;
  announcements: boolean;
};

export function NotificationBell() {
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    emailPrescriptionAlerts: true,
    systemPrescriptionAlerts: true,
    emailAppointmentReminders: true,
    systemAppointmentReminders: true,
    emailMedicineReminders: true,
    announcements: true,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.data) {
          setNotifications(data.data.items || []);
          setUnreadCount(data.data.unreadCount || 0);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // 20s poll

    // Close on click outside
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const openSettings = () => {
    fetch("/api/users/notification-preferences")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPrefs(data.data);
        }
      })
      .catch(() => {});
    setSettingsOpen(true);
    setIsOpen(false);
  };

  const handleSavePref = async (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    setSavingPrefs(true);
    try {
      await fetch("/api/users/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch {
      // Ignore
    } finally {
      setSavingPrefs(false);
    }
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markSingleRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "PRESCRIPTION_CREATED":
        return <Pill className="w-4 h-4 text-teal-600" />;
      case "APPOINTMENT_BOOKED":
      case "APPOINTMENT_REMINDER":
        return <Stethoscope className="w-4 h-4 text-sky-600" />;
      case "CHAT_REQUEST":
      case "CHAT_MESSAGE":
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      case "ANNOUNCEMENT":
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl border border-[var(--border-subtle)] text-slate-600 dark:text-slate-300 hover:bg-[var(--bg-subtle)] hover:text-[var(--brand-primary)] transition cursor-pointer"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-[var(--bg-surface)] animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {t.notifications}
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] text-[10px] font-black">
                  {unreadCount} {t.newBadge}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:text-[var(--brand-primary)] hover:bg-[var(--bg-subtle)] transition"
              >
                View all
              </Link>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:text-[var(--brand-primary)] hover:bg-[var(--bg-subtle)] transition flex items-center gap-1 cursor-pointer"
                  title={t.markAllRead}
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>{t.markAllRead}</span>
                </button>
              )}
              <button
                type="button"
                onClick={openSettings}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[var(--bg-subtle)] transition cursor-pointer"
                title={t.notificationAlertPrefs}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-[var(--border-subtle)]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-600 dark:text-slate-300">
                  {t.allCaughtUp}
                </p>
                <p>{t.noRecentNotifications}</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 transition flex items-start gap-3 text-xs ${
                    n.read
                      ? "opacity-80 hover:bg-[var(--bg-subtle)]/50"
                      : "bg-[var(--brand-surface)]/40 hover:bg-[var(--brand-surface)]/70 font-medium"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shrink-0 shadow-2xs">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white truncate">
                        {n.title}
                      </h4>
                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => markSingleRead(n.id)}
                          className="text-[10px] text-teal-600 hover:underline shrink-0"
                          title="Mark read"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">
                      {n.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => {
                            markSingleRead(n.id);
                            setIsOpen(false);
                          }}
                          className="font-bold text-[var(--brand-text)] hover:underline flex items-center gap-0.5"
                        >
                          <span>{t.openLink}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Notification Alert Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
            <div className="modal-header shrink-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[var(--brand-primary)]" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {t.notificationAlertPrefs}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <p className="text-slate-500">
                {t.notificationPrefsSubtitle}
              </p>

              {/* Prescription Alerts */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] space-y-2.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  {t.prescriptionAlerts}
                </span>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>{t.systemInAppAlert}</span>
                  <input
                    type="checkbox"
                    checked={prefs.systemPrescriptionAlerts}
                    onChange={(e) => handleSavePref("systemPrescriptionAlerts", e.target.checked)}
                    className="w-4 h-4 accent-[var(--brand-primary)]"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>{t.emailPrescriptionAlert}</span>
                  <input
                    type="checkbox"
                    checked={prefs.emailPrescriptionAlerts}
                    onChange={(e) => handleSavePref("emailPrescriptionAlerts", e.target.checked)}
                    className="w-4 h-4 accent-[var(--brand-primary)]"
                  />
                </label>
              </div>

              {/* Appointment Alerts */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] space-y-2.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  {t.appointmentQueueAlerts}
                </span>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>{t.systemQueueAlerts}</span>
                  <input
                    type="checkbox"
                    checked={prefs.systemAppointmentReminders}
                    onChange={(e) => handleSavePref("systemAppointmentReminders", e.target.checked)}
                    className="w-4 h-4 accent-[var(--brand-primary)]"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>{t.emailAppointmentConfirmations}</span>
                  <input
                    type="checkbox"
                    checked={prefs.emailAppointmentReminders}
                    onChange={(e) => handleSavePref("emailAppointmentReminders", e.target.checked)}
                    className="w-4 h-4 accent-[var(--brand-primary)]"
                  />
                </label>
              </div>

              {/* Medicine & Broadcasts */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] space-y-2.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  {t("uiMedicineRemindersAnnouncements")}
                </span>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>{t.medicineReminders}</span>
                  <input
                    type="checkbox"
                    checked={prefs.emailMedicineReminders}
                    onChange={(e) => handleSavePref("emailMedicineReminders", e.target.checked)}
                    className="w-4 h-4 accent-[var(--brand-primary)]"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>{t.hospitalAnnouncements}</span>
                  <input
                    type="checkbox"
                    checked={prefs.announcements}
                    onChange={(e) => handleSavePref("announcements", e.target.checked)}
                    className="w-4 h-4 accent-[var(--brand-primary)]"
                  />
                </label>
              </div>
            </div>

            <div className="modal-footer shrink-0 px-6 py-4 border-t border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="w-full py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white font-bold text-xs shadow-xs hover:opacity-95 transition cursor-pointer"
              >
                {savingPrefs ? t.saving : t.done}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
