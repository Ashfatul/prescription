"use client";

import { useState } from "react";
import {
  Stethoscope,
  Building2,
  Users,
  HeartPulse,
  Lock,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export interface DemoRole {
  id: "doctor" | "admin" | "staff" | "patient";
  label: string;
  email: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
}

interface LoginCompanionProps {
  onSelectRole?: (email: string, roleId: string) => void;
  currentEmail?: string;
}

export function LoginCompanion({ onSelectRole, currentEmail }: LoginCompanionProps) {
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<string>("doctor");

  const roles: DemoRole[] = [
    {
      id: "doctor",
      label: t.authDoctorChamber,
      email: "doctor@hospital.org",
      badge: "Clinical Lead",
      description: t.authDoctorRoleDesc,
      icon: <Stethoscope className="w-4 h-4 text-teal-500" />,
    },
    {
      id: "admin",
      label: t.authClinicAdmin,
      email: "admin@hospital.org",
      badge: "Hospital Ops",
      description: t.authAdminRoleDesc,
      icon: <Building2 className="w-4 h-4 text-sky-500" />,
    },
    {
      id: "staff",
      label: t.authChamberStaff,
      email: "staff@hospital.org",
      badge: "Front Desk",
      description: t.authStaffRoleDesc,
      icon: <Users className="w-4 h-4 text-amber-500" />,
    },
    {
      id: "patient",
      label: t.authPatientPortalRole,
      email: "patient@hospital.org",
      badge: "Health Pass",
      description: t.authPatientRoleDesc,
      icon: <HeartPulse className="w-4 h-4 text-rose-500" />,
    },
  ];

  const handleRoleClick = (role: DemoRole) => {
    setSelectedRole(role.id);
    if (onSelectRole) {
      onSelectRole(role.email, role.id);
    }
  };

  return (
    <div className="flex flex-col justify-between h-full space-y-6">
      {/* Top Header & Fast Pass */}
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-[10px] font-bold uppercase tracking-wider">
            <Zap className="w-3 h-3" />
            <span>{t.authRoleFastPassTitle}</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {t.authClinicalGateway}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.authRoleFastPassDesc}
          </p>
        </div>

        {/* 4 Interactive Role Cards */}
        <div className="space-y-2">
          {roles.map((role) => {
            const isSelected = selectedRole === role.id || currentEmail === role.email;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleClick(role)}
                className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? "bg-[var(--bg-surface)] border-[var(--brand-primary)] shadow-sm ring-1 ring-[var(--brand-primary)]/20"
                    : "bg-[var(--bg-surface)]/60 border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-surface)]"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                  {role.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {role.label}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[var(--bg-subtle)] text-slate-500 shrink-0">
                      {role.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-1 pt-0.5">
                    {role.description}
                  </p>
                  <span className="text-[10px] font-mono text-[var(--brand-primary)] block pt-1">
                    {role.email}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Security Telemetry Strip */}
      <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
          <Lock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
          <span>{t.authSecurityTelemetryTitle}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
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
