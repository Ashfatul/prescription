import { Metadata } from "next";
import Link from "next/link";
import { 
  Users, 
  ArrowLeft, 
  Clock, 
  PhoneCall, 
  Activity, 
  ShieldCheck, 
  Building2, 
  ClipboardList 
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StaffDirectory, StaffMember } from "@/components/staff/staff-directory";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";
import { db } from "@/lib/db";
import { RoleName } from "@prisma/client";

export const metadata: Metadata = {
  title: "Clinical Staff & Healthcare Team Directory | PPMS",
  description: "Browse registered hospital receptionists, front-desk triage staff, clinic administrators, and clinical coordinators on PPMS Clinical OS.",
};

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const [user, settings, staffRecords, orgs] = await Promise.all([
    getCurrentUserFromCookie(),
    getHospitalSettings(),
    db.user.findMany({
      where: {
        role: {
          name: { in: [RoleName.STAFF, RoleName.ADMIN, RoleName.DOCTOR] },
        },
        organization: {
          status: { not: "SUSPENDED" },
        },
      },
      include: {
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            contactPhone: true,
          },
        },
        doctor: {
          select: {
            specialization: true,
            degrees: true,
            designation: true,
            visitingHours: true,
            chamberAddress: true,
            available: true,
          },
        },
      },
      orderBy: [{ name: "asc" }],
    }),
    db.organization.findMany({
      where: { status: { not: "SUSPENDED" } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const staff: StaffMember[] = staffRecords.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    imageUrl: item.imageUrl,
    role: item.role.name as StaffMember["role"],
    createdAt: item.createdAt.toISOString(),
    organization: item.organization,
    doctor: item.doctor,
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Header loggedIn={!!user} />

      <main className="flex-1 w-full">
        {/* Top Directory Hero Banner */}
        <section className="w-full border-b border-[var(--border-subtle)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(14,165,233,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(56,189,248,0.14),transparent)]">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/" className="hover:text-[var(--brand-text)] flex items-center gap-1 transition">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <span>/</span>
              <span className="font-semibold text-[var(--text-primary)]">Clinical Staff & Teams</span>
            </div>

            {/* Title & Live Status Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider border border-sky-500/20">
                  <Users className="w-3.5 h-3.5" />
                  <span>Hospital Operations & Care Staff</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  Clinical Staff & Healthcare Team
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Browse front desk officers, triage coordinators, chamber administrators, and practice managers across our accredited clinic network.
                </p>
              </div>

              {/* Dynamic Badges */}
              <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 font-bold">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>{staff.length} Active Staff Members</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Building2 className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>Clinics Represented: <strong className="text-[var(--text-primary)]">{orgs.length}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>Front Desk Support: <strong className="text-[var(--text-primary)]">{settings.emergencyHotline}</strong></span>
                </div>
              </div>
            </div>

            {/* Regulatory Assurance Strip */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified Clinical Staff Profiles</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-sky-500" />
                <span>Reception, Triage & Queue Coordination</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-[var(--brand-text)]">
                <PhoneCall className="w-4 h-4" />
                <span>Central Medical Hotline: {settings.emergencyHotline}</span>
              </span>
            </div>
          </div>
        </section>

        {/* Directory Content Area */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <StaffDirectory initialStaff={staff} clinics={orgs} />
        </section>
      </main>

      <Footer initialSettings={settings} />
    </div>
  );
}
