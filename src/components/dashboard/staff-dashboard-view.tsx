"use client";

import { useSearchParams } from "next/navigation";
import { ReceptionManager } from "@/components/dashboard/reception-manager";
import { StaffSchedulingManager } from "@/components/dashboard/staff-scheduling-manager";
import { ClinicalChat } from "@/components/dashboard/clinical-chat";
import { AnnouncementsBanner } from "@/components/dashboard/announcements-banner";

export function StaffDashboardView({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "reception";

  return (
    <div className="space-y-6">
      {/* Broadcast Announcements Banner */}
      <AnnouncementsBanner />

      {/* Tab routing */}
      {tab === "schedules" && <StaffSchedulingManager />}
      {tab === "chat" && <ClinicalChat currentUserId={userId} />}
      {(tab === "reception" || (tab !== "schedules" && tab !== "chat")) && (
        <ReceptionManager />
      )}
    </div>
  );
}
