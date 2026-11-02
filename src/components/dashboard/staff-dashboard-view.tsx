"use client";

import { useSearchParams } from "next/navigation";
import { ReceptionManager } from "@/components/dashboard/reception-manager";
import { StaffSchedulingManager } from "@/components/dashboard/staff-scheduling-manager";
import { ClinicalChat } from "@/components/dashboard/clinical-chat";
import { AnnouncementsBanner } from "@/components/dashboard/announcements-banner";
import { AnnouncementsManager } from "@/components/dashboard/announcements-manager";

export function StaffDashboardView({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "checkin";

  return (
    <div className="space-y-6">
      {/* Broadcast Announcements Banner */}
      <AnnouncementsBanner />

      {/* Tab routing driven by Sidebar */}
      {tab === "schedules" && <StaffSchedulingManager />}
      {tab === "chat" && <ClinicalChat currentUserId={userId} />}
      {tab === "announcements" && <AnnouncementsManager canManage={true} userRole="STAFF" />}
      {tab === "verifications" && <ReceptionManager key="verifications" initialTab="verifications" />}
      {tab === "checkin" && <ReceptionManager key="checkin" initialTab="checkin" />}
      {tab === "queue" && <ReceptionManager key="queue" initialTab="queue" />}
      {tab === "patients" && <ReceptionManager key="patients" initialTab="patients" />}
      {tab !== "schedules" &&
        tab !== "chat" &&
        tab !== "announcements" &&
        tab !== "verifications" &&
        tab !== "checkin" &&
        tab !== "queue" &&
        tab !== "patients" && <ReceptionManager key="default-checkin" initialTab="checkin" />}
    </div>
  );
}
