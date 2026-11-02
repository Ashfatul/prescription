import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Stethoscope,
  Users,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Tv,
  BadgeCheck,
  CheckCircle2,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";
import { db } from "@/lib/db";
import { RoleName } from "@prisma/client";

interface ClinicPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ClinicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const clinic = await db.organization.findUnique({
    where: { slug },
    select: { name: true, address: true },
  });

  if (!clinic) {
    return {
      title: "Clinic Not Found | PPMS",
    };
  }

  return {
    title: `${clinic.name} - Info, Consulting Doctors & Staff | PPMS`,
    description: `View complete hospital details, chamber address, consulting physicians, visiting hours, and front desk staff for ${clinic.name}.`,
  };
}

export const dynamic = "force-dynamic";

export default async function ClinicDetailsPage({ params }: ClinicPageProps) {
  const { slug } = await params;

  const [user, settings, clinic] = await Promise.all([
    getCurrentUserFromCookie(),
    getHospitalSettings(),
    db.organization.findUnique({
      where: { slug },
      include: {
        plan: true,
        users: {
          where: {
            role: {
              name: { in: [RoleName.STAFF, RoleName.ADMIN, RoleName.DOCTOR] },
            },
          },
          include: {
            role: true,
            doctor: true,
          },
          orderBy: [{ role: { name: "asc" } }, { name: "asc" }],
        },
        doctors: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            users: true,
            doctors: true,
            patients: true,
            appointments: true,
            prescriptions: true,
          },
        },
      },
    }),
  ]);

  if (!clinic || clinic.status === "SUSPENDED") {
    notFound();
  }

  // Separate staff members (STAFF & ADMIN) from doctors for dedicated clean sections
  const staffMembers = clinic.users.filter((u) => u.role.name === "STAFF" || u.role.name === "ADMIN");
  const clinicDoctors = clinic.doctors;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Header loggedIn={!!user} />

      <main className="flex-1 w-full">
        {/* Top Hero Banner */}
        <section className="w-full border-b border-[var(--border-subtle)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(15,118,110,0.14),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(20,184,166,0.16),transparent)]">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/" className="hover:text-[var(--brand-text)] flex items-center gap-1 transition">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <span>/</span>
              <Link href="/clinics" className="hover:text-[var(--brand-text)] transition">
                Clinics
              </Link>
              <span>/</span>
              <span className="font-semibold text-[var(--text-primary)] truncate max-w-[200px] sm:max-w-none">
                {clinic.name}
              </span>
            </div>

            {/* Clinic Hero Identity Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[var(--brand-surface)] to-[var(--bg-subtle)] text-[var(--brand-primary)] border border-[var(--brand-border)] flex items-center justify-center font-black text-2xl shrink-0 shadow-sm ring-2 ring-[var(--brand-border)]/50">
                  <Building2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {clinic.name}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${
                        clinic.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          clinic.status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                        }`}
                      />
                      {clinic.status === "ACTIVE" ? "Active Clinical Chamber" : clinic.status}
                    </span>

                    {clinic.plan && (
                      <span className="px-2.5 py-1 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] text-xs font-bold border border-[var(--brand-border)]">
                        {clinic.plan.name}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 font-mono">
                    Facility Identifier: {clinic.slug}
                  </p>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {clinic.contactPhone && (
                  <a
                    href={`tel:${clinic.contactPhone}`}
                    className="px-4 py-2.5 rounded-2xl border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-xs font-bold text-slate-800 dark:text-slate-200 transition flex items-center gap-2"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Call Hotline: {clinic.contactPhone}</span>
                  </a>
                )}

                <Link
                  href={`/doctors?search=${encodeURIComponent(clinic.name)}`}
                  className="px-5 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white hover:opacity-95 text-xs font-bold transition flex items-center gap-2 shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Appointment / Token</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-[var(--border-subtle)]">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Healthcare Team
                </span>
                <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {staffMembers.length} Staff
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Consulting Doctors
                </span>
                <p className="text-lg sm:text-xl font-black text-[var(--brand-text)]">
                  {clinicDoctors.length} Specialists
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Enrolled Patients
                </span>
                <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {clinic._count.patients} Patients
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Digital Prescriptions
                </span>
                <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {clinic._count.prescriptions} Issued
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Clinic Main Content Body */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
          {/* Section 1: Facility Location & Contact Profile */}
          <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
              <MapPin className="w-5 h-5 text-[var(--brand-primary)]" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Chamber Address & Contact Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1.5 p-4 rounded-2xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  Chamber Physical Location
                </span>
                <p className="font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {clinic.address || "Chamber address available on prescription voucher"}
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Direct Hotline & Emergency
                </span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {clinic.contactPhone ? (
                    <a href={`tel:${clinic.contactPhone}`} className="hover:text-[var(--brand-primary)] transition">
                      {clinic.contactPhone}
                    </a>
                  ) : (
                    "Hotline provided upon serial confirmation"
                  )}
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Administrative Contact
                </span>
                <p className="font-semibold text-slate-900 dark:text-white truncate">
                  {clinic.contactEmail ? (
                    <a href={`mailto:${clinic.contactEmail}`} className="hover:text-[var(--brand-primary)] transition">
                      {clinic.contactEmail}
                    </a>
                  ) : (
                    "Inquiries via central helpdesk"
                  )}
                </p>
              </div>
            </div>

            {/* Features Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                BMDC Verified Prescription Printing
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                <Tv className="w-4 h-4 text-[var(--brand-primary)]" />
                Live Chamber Waiting TV Display
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                <ShieldCheck className="w-4 h-4 text-sky-500" />
                HIPAA Aligned EMR Storage
              </span>
            </div>
          </div>

          {/* Section 2: Dedicated Staff Members of this Clinic */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--brand-primary)]" />
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Clinic Operations & Front Desk Staff
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Receptionists, triage coordinators, and administrative officers for {clinic.name}.
                </p>
              </div>

              <Link
                href="/staff"
                className="text-xs font-bold text-[var(--brand-text)] hover:underline flex items-center gap-1"
              >
                <span>View Global Staff Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {staffMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffMembers.map((member) => {
                  const isStaff = member.role.name === "STAFF";
                  const isAdmin = member.role.name === "ADMIN";

                  return (
                    <div
                      key={member.id}
                      className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/40 transition-all space-y-4 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {member.imageUrl ? (
                            <Image
                              src={member.imageUrl}
                              alt={member.name}
                              width={44}
                              height={44}
                              className="w-11 h-11 rounded-2xl object-cover shrink-0 border border-[var(--border-subtle)]"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-black text-base shrink-0 border border-[var(--brand-border)]">
                              {member.name.charAt(0)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight truncate">
                              {member.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 truncate">
                              {isAdmin ? "Clinic Administrator & Operations" : "Front Desk & Triage Receptionist"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shrink-0 ${
                            isAdmin
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                              : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                          }`}
                        >
                          {member.role.name}
                        </span>
                      </div>

                      {/* Responsibilities */}
                      <div className="p-3 rounded-xl bg-[var(--bg-subtle)]/70 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        <p className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider">
                          Key Responsibilities:
                        </p>
                        <p>
                          {isStaff
                            ? "Patient check-in, vital signs triage, chamber calling tokens & receptionist duties."
                            : "Doctor onboarding, clinic schedule management & operational oversight."}
                        </p>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-1 text-xs text-slate-500 pt-1">
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a href={`mailto:${member.email}`} className="hover:text-[var(--brand-primary)] truncate">
                            {member.email}
                          </a>
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <a href={`tel:${member.phone}`} className="hover:text-[var(--brand-primary)]">
                              {member.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-default)] text-center space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="font-bold text-slate-900 dark:text-white">
                  No staff members assigned to this clinic yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Hospital administrators can register receptionists and front desk coordinators from the administrative control panel.
                </p>
              </div>
            )}
          </div>

          {/* Section 3: Consulting Doctors Practicing at this Clinic */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-[var(--brand-primary)]" />
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Consulting Physicians & Specialists
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Verified medical specialists holding chambers at {clinic.name}.
                </p>
              </div>

              <Link
                href={`/doctors?search=${encodeURIComponent(clinic.name)}`}
                className="text-xs font-bold text-[var(--brand-text)] hover:underline flex items-center gap-1"
              >
                <span>View Full Visiting Schedules</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {clinicDoctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clinicDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/40 transition-all space-y-5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        {doc.user.imageUrl ? (
                          <Image
                            src={doc.user.imageUrl}
                            alt={doc.user.name}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-[var(--border-subtle)] ring-2 ring-[var(--brand-border)]/50"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-black text-lg shrink-0">
                            {doc.user.name.charAt(0)}
                          </div>
                        )}

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                              {doc.user.name}
                            </h3>
                            <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          </div>
                          <p className="text-xs font-bold text-[var(--brand-text)]">
                            {doc.specialization}
                          </p>
                          {doc.degrees && (
                            <p className="text-[11px] text-slate-500">
                              {doc.degrees}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Chamber Active
                      </span>
                    </div>

                    {/* Visiting Chamber Details */}
                    <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] text-xs text-slate-600 dark:text-slate-300 space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
                        <span>Chamber: <strong>{doc.chamberAddress || "Diagnostic & Consultation Block"}</strong></span>
                      </div>
                      {doc.bmdcRegNo && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>BMDC Registration: <strong className="font-mono">{doc.bmdcRegNo}</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-3">
                      <div className="text-xs">
                        <span className="text-slate-400">Consultation Fee: </span>
                        <strong className="text-slate-900 dark:text-white font-black">
                          {doc.newPatientFee ? `$${doc.newPatientFee}` : "Standard OPD"}
                        </strong>
                      </div>

                      <Link
                        href={`/doctors?search=${encodeURIComponent(doc.user.name)}`}
                        className="px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white hover:opacity-95 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Serial</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-default)] text-center space-y-2">
                <Stethoscope className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="font-bold text-slate-900 dark:text-white">
                  No physicians assigned to this chamber yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Physicians can register their chamber practice or be assigned by clinic administration.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer initialSettings={settings} />
    </div>
  );
}
