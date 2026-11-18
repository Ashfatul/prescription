"use client";

import { useState } from "react";
import {
  Stethoscope,
  Building2,
  Users,
  HeartPulse,
  Lock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface PortalRoleInfo {
  id: "doctor" | "admin" | "staff" | "patient";
  label: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
}

export function LoginCompanion() {
  const { t } = useLanguage();
  const [activeRole, setActiveRole] = useState<string>("doctor");

  const roles: PortalRoleInfo[] = [
    {
      id: "doctor",
      label: t.authDoctorChamber,
      badge: t.authBadgeClinicalLead,
      description: t.authDoctorRoleDesc,
      icon: <Stethoscope className="w-4 h-4 text-[var(--brand-primary)]" />,
    },
    {
      id: "admin",
      label: t.authClinicAdmin,
      badge: t.authBadgeHospitalOps,
      description: t.authAdminRoleDesc,
      icon: <Building2 className="w-4 h-4 text-sky-500" />,
    },
    {
      id: "staff",
      label: t.authChamberStaff,
      badge: t.authBadgeFrontDesk,
      description: t.authStaffRoleDesc,
      icon: <Users className="w-4 h-4 text-amber-500" />,
    },
    {
      id: "patient",
      label: t.authPatientPortalRole,
      badge: t.authBadgeHealthPass,
      description: t.authPatientRoleDesc,
      icon: <HeartPulse className="w-4 h-4 text-rose-500" />,
    },
  ];

  return (
    <div className="flex flex-col justify-between h-full space-y-6">
      {/* Top Header & Role Portals Overview */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.authWorkspacesBadge}</span>
          </div>
          <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight">
            {t.authClinicalGateway}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {t.authWorkspacesDesc}
          </p>
        </div>

        {/* 4 Clean Informational Portal Cards (No Fake/Misleading Emails) */}
        <div className="space-y-2">
          {roles.map((role) => {
            const isActive = activeRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setActiveRole(role.id)}
                className={`w-full p-3.5 rounded-lg border text-left transition-colors cursor-pointer flex items-start gap-3 ${
                  isActive
                    ? "bg-[var(--bg-surface)] border-[var(--brand-border)] shadow-2xs"
                    : "bg-[var(--bg-surface)]/50 border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-surface)]"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                  {role.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {role.label}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-secondary)] shrink-0">
                      {role.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-snug pt-1">
                    {role.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Security Telemetry Strip */}
      <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
          <Lock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
          <span>{t.authSecurityTelemetryTitle}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="truncate">{t.authSecurityBcrypt}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="truncate">{t.authSecurityTotp}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="truncate">{t.authSecurityRateLimit}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="truncate">{t.authSecurityAudit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
