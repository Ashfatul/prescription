"use client";

import Link from "next/link";
import Image from "next/image";
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
import { ClinicSubdomainBadge } from "@/components/clinics/clinic-subdomain-badge";
import { useLanguage } from "@/lib/i18n/language-context";

export interface ClinicStaffUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  imageUrl: string | null;
  role: {
    name: string;
  };
}

export interface ClinicDoctorUser {
  id: string;
  specialization: string;
  degrees?: string | null;
  chamberAddress?: string | null;
  bmdcRegNo?: string | null;
  newPatientFee?: number | null;
  user: {
    name: string;
    imageUrl?: string | null;
  };
}

export interface ClinicDetailsViewProps {
  clinic: {
    id: string;
    name: string;
    slug: string;
    status: string;
    address?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
    plan?: {
      name: string;
    } | null;
    _count: {
      patients: number;
      prescriptions: number;
    };
  };
  staffMembers: ClinicStaffUser[];
  clinicDoctors: ClinicDoctorUser[];
  isDemoClinic?: boolean;
}

export function ClinicDetailsView({
  clinic,
  staffMembers,
  clinicDoctors,
  isDemoClinic = false,
}: ClinicDetailsViewProps) {
  const { t, language } = useLanguage();

  return (
    <main className="flex-1 w-full">
      {/* Top Hero Banner */}
      <section className="w-full border-b border-[var(--border-subtle)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(15,118,110,0.14),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(20,184,166,0.16),transparent)]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-[var(--brand-text)] flex items-center gap-1 transition">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.home}</span>
            </Link>
            <span>/</span>
            <Link href="/clinics" className="hover:text-[var(--brand-text)] transition">
              {t.clinicsAndChambers}
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
                    {clinic.status === "ACTIVE"
                      ? (t("uiActiveClinicalChamber"))
                      : clinic.status}
                  </span>

                  {isDemoClinic && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                      {t("demoSandbox")}
                    </span>
                  )}

                  {clinic.plan && (
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] text-xs font-bold border border-[var(--brand-border)]">
                      {clinic.plan.name}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  <p className="text-xs text-slate-500 font-mono">
                    {t("uiFacilityIdentifier")}{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{clinic.slug}</span>
                  </p>
                  <ClinicSubdomainBadge slug={clinic.slug} clinicName={clinic.name} />
                </div>
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
                  <span>{t("uiCallHotline")} {clinic.contactPhone}</span>
                </a>
              )}

              <Link
                href={`/live-queue?clinic=${encodeURIComponent(clinic.slug)}`}
                className="px-4 py-2.5 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] hover:opacity-95 text-xs font-bold transition flex items-center gap-2 shadow-2xs"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>{t("uiLiveChamberTV")}</span>
              </Link>

              <Link
                href={`/doctors?clinic=${encodeURIComponent(clinic.slug)}`}
                className="px-5 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white hover:opacity-95 text-xs font-bold transition flex items-center gap-2 shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t("uiBookAppointmentToken")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-[var(--border-subtle)]">
            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t("uiHealthcareTeam")}
              </span>
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {staffMembers.length} {t("uiStaff")}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t.consultingPhysicians}
              </span>
              <p className="text-lg sm:text-xl font-black text-[var(--brand-text)]">
                {clinicDoctors.length} {t("uiSpecialists2")}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t.enrolledPatients}
              </span>
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {clinic._count.patients} {t("rolePatientsVariant2")}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t.prescriptions}
              </span>
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {clinic._count.prescriptions} {t("uiIssued2")}
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
              {t("uiChamberAddressContactInformation")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-1.5 p-4 rounded-2xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                {t("uiChamberPhysicalLocation")}
              </span>
              <p className="font-semibold text-slate-900 dark:text-white leading-relaxed">
                {clinic.address || (t("uiChamberAddressAvailableOnPrescription"))}
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {t("uiDirectHotlineEmergency")}
              </span>
              <p className="font-semibold text-slate-900 dark:text-white">
                {clinic.contactPhone ? (
                  <a href={`tel:${clinic.contactPhone}`} className="hover:text-[var(--brand-primary)] transition">
                    {clinic.contactPhone}
                  </a>
                ) : (
                  t("uiHotlineProvidedUponSerialConfirmation")
                )}
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {t("uiAdministrativeContact")}
              </span>
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {clinic.contactEmail ? (
                  <a href={`mailto:${clinic.contactEmail}`} className="hover:text-[var(--brand-primary)] transition">
                    {clinic.contactEmail}
                  </a>
                ) : (
                  t("uiInquiriesViaCentralHelpdesk")
                )}
              </p>
            </div>
          </div>

          {/* Features Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {t("uiBmdcVerifiedPrescriptionPrinting")}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
              <Tv className="w-4 h-4 text-[var(--brand-primary)]" />
              {t("uiLiveChamberWaitingTVDisplay")}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
              <ShieldCheck className="w-4 h-4 text-sky-500" />
              {t("uiHipaaAlignedEMRStorage")}
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
                  {t("uiClinicOperationsFrontDeskStaff")}
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                {language === "bn"
                  ? `${clinic.name}-এর অভ্যর্থনাকারী, ট্রায়াজ সমন্বয়কারী ও প্রশাসনিক কর্মকর্তা।`
                  : `Receptionists, triage coordinators, and administrative officers for ${clinic.name}.`}
              </p>
            </div>

            <Link
              href="/staff"
              className="text-xs font-bold text-[var(--brand-text)] hover:underline flex items-center gap-1"
            >
              <span>{t("uiViewGlobalStaffDirectory")}</span>
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
                            {isAdmin
                              ? (t("uiClinicAdministratorOperations"))
                              : (t("uiFrontDeskTriageReceptionist"))}
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
                        {t("uiKeyResponsibilities")}
                      </p>
                      <p>
                        {isStaff
                          ? (t("rolePatientCheckInVitalSignsTriageChamberCallingTokensAndReceptionistDuties"))
                          : (t("roleDoctorOnboardingClinicScheduleManagementAndOperationalOversight"))}
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
                {t("uiNoStaffMembersAssignedTo")}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t("uiHospitalAdministratorsCanRegisterReceptionists")}
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
                  {t.consultingPhysiciansSpecialists}
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                {language === "bn"
                  ? `${clinic.name}-এ চেম্বার পরিচালনাকারী অনুমোদিত বিশেষজ্ঞ চিকিৎসকবৃন্দ।`
                  : `Verified medical specialists holding chambers at ${clinic.name}.`}
              </p>
            </div>

            <Link
              href={`/doctors?clinic=${encodeURIComponent(clinic.slug)}`}
              className="text-xs font-bold text-[var(--brand-text)] hover:underline flex items-center gap-1"
            >
              <span>{t("uiViewFullVisitingSchedules")}</span>
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
                      {t("uiChamberActive")}
                    </span>
                  </div>

                  {/* Visiting Chamber Details */}
                  <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] text-xs text-slate-600 dark:text-slate-300 space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
                      <span>{t("uiChamber")} <strong>{doc.chamberAddress || (t("uiDiagnosticConsultationBlock"))}</strong></span>
                    </div>
                    {doc.bmdcRegNo && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{t("uiBmdcRegistration")} <strong className="font-mono">{doc.bmdcRegNo}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="text-slate-400">{t("uiConsultationFee")}</span>
                      <strong className="text-slate-900 dark:text-white font-black font-mono">
                        {doc.newPatientFee ? `$${doc.newPatientFee}` : (t("uiStandardOPD"))}
                      </strong>
                    </div>

                    <Link
                      href={`/doctors?search=${encodeURIComponent(doc.user.name)}`}
                      className="px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white hover:opacity-95 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{t.bookSerial}</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-default)] text-center space-y-2">
              <Stethoscope className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-900 dark:text-white">
                {t("uiNoPhysiciansAssignedToThis")}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t("uiPhysiciansCanRegisterTheirChamber")}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
