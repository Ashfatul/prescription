"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ReceptionManager } from "@/components/dashboard/reception-manager";
import { StaffSchedulingManager } from "@/components/dashboard/staff-scheduling-manager";
import { ClinicalChat } from "@/components/dashboard/clinical-chat";
import { AnnouncementsBanner } from "@/components/dashboard/announcements-banner";
import { AnnouncementsManager } from "@/components/dashboard/announcements-manager";

export function StaffDashboardView({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") || "reception";

  const handleTabChange = (newTab: string) => {
    router.replace(`/dashboard/staff?tab=${newTab}`);
  };

  return (
    <div className="space-y-6">
      {/* Broadcast Announcements Banner */}
      <AnnouncementsBanner />

      {/* Horizontal Dashboard Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "reception", label: "📋 Reception Desk & Walk-ins" },
          { id: "schedules", label: "📅 Doctor Visiting Schedules" },
          { id: "chat", label: "💬 Clinical Consultation Chat" },
          { id: "announcements", label: "📢 Hospital Bulletins" },
        ].map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTabChange(t.id)}
              className={`shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                isActive
                  ? "bg-[var(--brand-primary)] text-white shadow-sm"
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab routing */}
      {tab === "schedules" && <StaffSchedulingManager />}
      {tab === "chat" && <ClinicalChat currentUserId={userId} />}
      {tab === "announcements" && <AnnouncementsManager canManage={true} userRole="STAFF" />}
      {(tab === "reception" || (tab !== "schedules" && tab !== "chat" && tab !== "announcements")) && (
        <ReceptionManager />
      )}
    </div>
  );
}
