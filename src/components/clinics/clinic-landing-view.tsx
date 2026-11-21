"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Stethoscope,
  Ticket,
  Tv,
  UserCheck,
  Users,
} from "lucide-react";
import { ClinicSubdomainBadge } from "@/components/clinics/clinic-subdomain-badge";
import { useLanguage } from "@/lib/i18n/language-context";

export interface ClinicLandingDoctor {
  id: string;
  specialization: string;
  degrees?: string | null;
  chamberAddress?: string | null;
  bmdcRegNo?: string | null;
  newPatientFee?: number | null;
  available?: boolean;
  user: {
    name: string;
    imageUrl?: string | null;
  };
}

export interface ClinicLandingViewProps {
  clinic: {
    id: string;
    name: string;
    slug: string;
    status: string;
    address?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
    logoUrl?: string | null;
    planName?: string | null;
    _count: {
      doctors: number;
      patients: number;
      prescriptions: number;
      appointments: number;
    };
  };
  doctors: ClinicLandingDoctor[];
}

export function ClinicLandingView({ clinic, doctors }: ClinicLandingViewProps) {
  const { t } = useLanguage();

  return (
    <main className="flex-1 w-full">
      {/* ============================================================ */}
      {/* HERO — same rhythm as ClinicsHero / DoctorsHero              */}
      {/* ============================================================ */}
      <section className="relative w-full overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="pointer-events-none absolute inset-0 clinical-grid-bg [mask-image:radial-gradient(ellipse_75%_80%_at_50%_0%,#000_35%,transparent_100%)]" />
        <div className="pointer-events-none absolute inset-0 hero-brand-glow" />

        <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
          <div className="grid lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-8 space-y-2.5">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-text)]">
                <Building2 className="w-3.5 h-3.5" />
                {t("uiLandingVerifiedFacility", "Verified Healthcare Facility")}
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-[-0.03em] leading-tight break-words">
                {clinic.name}
              </h1>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-[60ch]">
                {t("uiLandingHeroTagline", "Modern diagnostics, trusted physicians and a calmer way to get care — all under one roof.")}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <Link
                  href={`/doctors?clinic=${encodeURIComponent(clinic.slug)}`}
                  className="min-h-[42px] px-4 py-2.5 rounded-lg bg-[var(--brand-primary)] text-white hover:opacity-95 text-xs font-bold transition inline-flex items-center gap-2 shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  {t("uiLandingBookAppointment", "Book an Appointment")}
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </Link>
                {clinic.contactPhone && (
                  <a
                    href={`tel:${clinic.contactPhone}`}
                    className="min-h-[42px] px-4 py-2.5 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-xs font-bold text-[var(--text-primary)] transition inline-flex items-center gap-2"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
                    {t("uiLandingCallClinic", "Call the Clinic")}
                  </a>
                )}
                <Link
                  href={`/clinics/${clinic.slug}`}
                  className="min-h-[42px] px-3.5 py-2.5 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--brand-text)] transition inline-flex items-center gap-1.5"
                >
                  {t("uiLandingBackToDirectory", "Clinic profile & staff")}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <ClinicSubdomainBadge slug={clinic.slug} clinicName={clinic.name} />
            </div>

            {/* Inline metrics — pills, not cards */}
            <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-2.5 text-xs">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>
                  {clinic._count.doctors} {t("uiLandingStatsSpecialists", "Consulting specialists")}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                <Users className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span>
                  {t("uiLandingStatsPatients", "Patients cared for")}:{" "}
                  <strong className="font-mono font-bold text-[var(--text-primary)]">{clinic._count.patients}</strong>
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                <FileText className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span>
                  {t("uiLandingStatsPrescriptions", "Prescriptions")}:{" "}
                  <strong className="font-mono font-bold text-[var(--text-primary)]">{clinic._count.prescriptions}</strong>
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                <Ticket className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span>
                  {t("uiLandingStatsAppointments", "Appointments")}:{" "}
                  <strong className="font-mono font-bold text-[var(--text-primary)]">{clinic._count.appointments}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              {t("bmdcRegulatedHipaa", "BMDC regulated · HIPAA-aligned records")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[var(--brand-primary)]" />
              {t("liveQueueCallingScreens", "Live queue calling screens")}
            </span>
            {clinic.contactPhone && (
              <a href={`tel:${clinic.contactPhone}`} className="inline-flex items-center gap-1.5 font-semibold text-[var(--brand-text)] hover:underline">
                <PhoneCall className="w-3.5 h-3.5" />
                {t("centralMedicalHotline", "Medical hotline")}: {clinic.contactPhone}
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12">
        {/* ============================================================ */}
        {/* DOCTORS — standard app doctor grid                           */}
        {/* ============================================================ */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[var(--brand-primary)]" />
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                  {t("uiLandingMeetSpecialists", "Meet Our Specialists")}
                </h2>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {t("uiLandingMeetSpecialistsDesc", "Consulting physicians available at this chamber. Choose a specialist and reserve your visit slot in seconds.")}
              </p>
            </div>
            <Link
              href={`/doctors?clinic=${encodeURIComponent(clinic.slug)}`}
              className="text-xs font-bold text-[var(--brand-text)] hover:underline flex items-center gap-1 shrink-0"
            >
              {t("viewAllDoctors", "View all doctors")}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {doctors.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col justify-between p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--brand-border)] hover:shadow-md transition-all group"
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      {doc.user.imageUrl ? (
                        <Image
                          src={doc.user.imageUrl}
                          alt={doc.user.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-lg object-cover shrink-0 border border-[var(--border-subtle)] shadow-2xs group-hover:border-[var(--brand-border)] transition"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[var(--brand-surface)] to-[var(--bg-subtle)] text-[var(--brand-text)] flex items-center justify-center font-black text-xl shrink-0 border border-[var(--border-subtle)]">
                          {doc.user.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-2 h-2 rounded-full ${doc.available ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${doc.available ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--text-muted)]"}`}>
                            {doc.available ? t("chamberOpen", "Chamber open") : t("chamberOffline", "Chamber offline")}
                          </span>
                        </div>
                        <p className="text-base font-bold text-[var(--text-primary)] truncate" title={doc.user.name}>
                          {doc.user.name}
                        </p>
                        {doc.degrees && (
                          <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5" title={doc.degrees}>
                            {doc.degrees}
                          </p>
                        )}
                        <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)]/50 mt-1.5 truncate max-w-full">
                          {doc.specialization}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-3 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                      <span className="truncate">{doc.chamberAddress || clinic.address || t("uiLandingLocationFallback", "Address shared on your confirmed appointment")}</span>
                    </div>

                    {doc.bmdcRegNo && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] mb-3">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        {t("uiBmdcRegistration", "BMDC Registration")}{" "}
                        <strong className="font-mono text-[var(--text-secondary)]">{doc.bmdcRegNo}</strong>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] mb-3 text-center">
                      <div className="p-1">
                        <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block tracking-wider">
                          {t("uiLandingConsultationFee", "Consultation fee")}
                        </span>
                        <span className="font-black text-xs text-[var(--brand-text)] font-mono">
                          {doc.newPatientFee ? `$${doc.newPatientFee}` : t("uiStandardOPD", "Standard OPD")}
                        </span>
                      </div>
                      <div className="p-1 border-l border-[var(--border-subtle)]">
                        <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block tracking-wider">
                          {t("uiLandingStatsAppointments", "Appointments")}
                        </span>
                        <span className="font-black text-xs text-slate-700 dark:text-slate-200 font-mono">
                          {clinic._count.appointments}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/doctors/${doc.id}`}
                        className="py-2.5 px-3 rounded-xl border border-[var(--border-default)] hover:border-[var(--brand-border)] bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-semibold text-center transition flex-1 flex items-center justify-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        {t("viewDetails", "View details")}
                      </Link>
                      <Link
                        href={`/doctors?search=${encodeURIComponent(doc.user.name)}`}
                        className="py-2.5 px-3 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold hover:opacity-90 transition shadow-xs flex-1 flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {t("bookSerial", "Book Serial")}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-default)] text-center space-y-2">
              <Stethoscope className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
              <h3 className="font-bold text-[var(--text-primary)]">{t("uiNoPhysiciansAssignedToThis", "No physicians assigned yet")}</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                {t("uiLandingNoSpecialists", "Our visiting specialist roster is being updated. Please call the chamber for the current schedule.")}
              </p>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* CHAMBER INFO — single panel, matches details view            */}
        {/* ============================================================ */}
        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
            <MapPin className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              {t("uiLandingVisitTitle", "Find us & get in touch")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-1.5 p-4 rounded-lg bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                {t("uiLandingChamberLocation", "Chamber location")}
              </span>
              <p className="font-semibold text-[var(--text-primary)] leading-relaxed">
                {clinic.address || t("uiLandingLocationFallback", "Address shared on your confirmed appointment")}
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-lg bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                {t("uiLandingAppointmentHotline", "Appointment hotline")}
              </span>
              <p className="font-semibold text-[var(--text-primary)]">
                {clinic.contactPhone ? (
                  <a href={`tel:${clinic.contactPhone}`} className="hover:text-[var(--brand-primary)] transition">{clinic.contactPhone}</a>
                ) : (
                  t("uiHotlineProvidedUponSerialConfirmation", "Hotline provided upon serial confirmation")
                )}
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-lg bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                {t("uiLandingFrontDeskEmail", "Front desk email")}
              </span>
              <p className="font-semibold text-[var(--text-primary)] truncate">
                {clinic.contactEmail ? (
                  <a href={`mailto:${clinic.contactEmail}`} className="hover:text-[var(--brand-primary)] transition">{clinic.contactEmail}</a>
                ) : (
                  t("uiInquiriesViaCentralHelpdesk", "Inquiries via central helpdesk")
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {t("uiBmdcVerifiedPrescriptionPrinting", "BMDC verified prescription printing")}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
              <Tv className="w-4 h-4 text-[var(--brand-primary)]" />
              {t("uiLiveChamberWaitingTVDisplay", "Live chamber waiting TV display")}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
              <ShieldCheck className="w-4 h-4 text-sky-500" />
              {t("uiHipaaAlignedEMRStorage", "HIPAA-aligned EMR storage")}
            </span>
            <Link
              href={`/live-queue?clinic=${encodeURIComponent(clinic.slug)}`}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold hover:opacity-90 transition"
            >
              <Tv className="w-4 h-4" />
              {t("uiLandingOpenChamberTv", "Live chamber screen")}
            </Link>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CTA — one slim banner, same pattern as directory callout     */}
        {/* ============================================================ */}
        <div className="rounded-xl p-6 sm:p-10 bg-gradient-to-br from-[var(--brand-surface)] via-[var(--bg-surface)] to-[var(--bg-subtle)] border border-[var(--brand-border)]/60 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-text)] text-xs font-extrabold uppercase tracking-wider">
              <BadgeCheck className="w-3.5 h-3.5" />
              {clinic.name}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {t("uiLandingCtaTitle", "Ready when you are.")}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {t("uiLandingCtaDesc", "Pick a specialist, book your token and walk in with confidence.")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href={`/doctors?clinic=${encodeURIComponent(clinic.slug)}`}
              className="w-full sm:w-auto px-5 py-3 rounded-lg bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 whitespace-nowrap min-h-[44px]"
            >
              <Calendar className="w-4 h-4" />
              {t("uiLandingCtaButton", "Find a doctor & book")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            {clinic.contactPhone && (
              <a
                href={`tel:${clinic.contactPhone}`}
                className="w-full sm:w-auto px-4 py-3 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] font-bold text-xs transition text-center min-h-[44px] flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                {t("uiLandingCallClinic", "Call the Clinic")}
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
