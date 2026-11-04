"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Stethoscope,
  ArrowLeft,
  Clock,
  PhoneCall,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Award,
  Building2,
  Activity,
  Tv,
  Bell,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { DoctorBookingButton } from "@/app/doctors/[id]/doctor-booking-button";
import { DoctorScheduleDisplay } from "@/components/doctors/doctor-schedule-display";
import { ScheduleData } from "@/lib/doctor-schedule";
import { useLanguage } from "@/lib/i18n/language-context";

export interface DoctorProfileData {
  id: string;
  specialization: string;
  degrees?: string | null;
  designation?: string | null;
  hospital?: string | null;
  bmdcRegNo?: string | null;
  experienceYears?: number | string | null;
  available?: boolean;
  chamberAddress?: string | null;
  contactNumber?: string | null;
  bio?: string | null;
  newPatientFee?: number | null;
  followupFee?: number | null;
  followupValidityDays?: number | null;
  reportFreeDays?: number | null;
  consultationFee?: string | null;
  visitingHours?: string | null;
  signatureUrl?: string | null;
  scheduleJson?: unknown;
  user: {
    name: string;
    email?: string | null;
    imageUrl?: string | null;
  };
}

export interface DoctorQueueData {
  currentSerial: number | null;
  nextSerial: number | null;
  previousSerial: number | null;
  missedSerials: number[];
  total: number;
  totalBooked: number;
  totalCompleted: number;
}

export interface DoctorProfileViewProps {
  doctor: DoctorProfileData;
  queue: DoctorQueueData;
  canBook: boolean;
  isDoctorRole: boolean;
  isStaffRole: boolean;
}

export function DoctorProfileView({
  doctor,
  queue,
  canBook,
  isDoctorRole,
  isStaffRole,
}: DoctorProfileViewProps) {
  const { t, language } = useLanguage();

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link
          href="/doctors"
          className="hover:text-[var(--brand-text)] flex items-center gap-1.5 transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.allSpecialistsDirectory}</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-[var(--text-primary)] truncate">
          {doctor.user.name}
        </span>
      </div>

      {/* Top Doctor Profile Card */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          {/* Left: Avatar & Primary Credentials */}
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="relative h-28 w-28 sm:h-36 sm:w-36 shrink-0 overflow-hidden rounded-3xl bg-[var(--bg-subtle)] border-2 border-[var(--brand-border)] shadow-md">
              {doctor.user.imageUrl ? (
                <Image
                  src={doctor.user.imageUrl}
                  alt={doctor.user.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-black text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                  Dr.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold uppercase tracking-wider">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>{doctor.specialization}</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    doctor.available
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      doctor.available ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  <span>{doctor.available ? (t("uiChamberOpen2")) : (t("chamberPausedAway"))}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {doctor.user.name}
              </h1>

              {doctor.degrees && (
                <p className="text-sm sm:text-base font-semibold text-[var(--brand-text)]">
                  {doctor.degrees}
                </p>
              )}

              {doctor.designation && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {doctor.designation}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 pt-1">
                {doctor.hospital && (
                  <span className="flex items-center gap-1 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doctor.hospital}</span>
                  </span>
                )}
                {doctor.bmdcRegNo && (
                  <span className="flex items-center gap-1 font-mono font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t("uiBmdcReg")} {doctor.bmdcRegNo}</span>
                  </span>
                )}
                {doctor.experienceYears && (
                  <span className="flex items-center gap-1 font-medium">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t("uiExperience")} {doctor.experienceYears} {t("uiYears")}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Live Queue Badge & Action */}
          <div className="w-full md:w-auto p-5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-3 shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t.liveOutpatientQueue}
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-[var(--brand-text)]">
                  {(queue.currentSerial ?? 0) > 0 ? `#${queue.currentSerial}` : "#--"}
                </span>
                <span className="text-xs text-slate-500 font-medium">{t.currentlyInChamber}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {t.totalPatientsBookedToday} <strong>{queue.total}</strong>
              </p>
            </div>

            {canBook ? (
              <DoctorBookingButton doctorId={doctor.id} doctorName={doctor.user.name} />
            ) : isDoctorRole ? (
              <div className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 text-center">
                {t.loggedInAsDoctor}
              </div>
            ) : isStaffRole ? (
              <div className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 text-center">
                {t.loggedInAsStaff}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Dedicated Doctor Live Chamber Queue Sequence */}
      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] text-[11px] font-bold uppercase tracking-wider border border-[var(--brand-border)]">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>
                {t("uiLiveRoomSequence")}
                {doctor.chamberAddress || (t("uiChamberConsultationRoom"))}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.todayConsultationTurnStatus}
            </h3>
            <p className="text-xs text-slate-500">
              {t.patientsCalledSequentially}
            </p>
          </div>

          <Link
            href={`/live-queue?doctorId=${doctor.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs font-bold text-[var(--brand-text)] hover:border-[var(--brand-primary)] transition shadow-2xs self-start sm:self-auto"
          >
            <Tv className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>{t.fullHospitalTvDisplay}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Cards: Now Consulting, Next in Line, Previous Patient, Missed Serials */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 1. Now Consulting */}
          <div className="p-4 rounded-2xl bg-[var(--brand-surface)] border border-[var(--brand-primary)]/40 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--brand-text)] flex items-center gap-1">
              <Bell className="w-3 h-3 text-[var(--brand-primary)] animate-bounce" />
              <span>{t.nowCalling}</span>
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[var(--brand-text)] font-mono">
              #{queue.currentSerial ? queue.currentSerial.toString().padStart(2, "0") : "--"}
            </div>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block">
              {queue.currentSerial
                ? (t("uiInsideChamber"))
                : (t("uiChamberReady"))}
            </span>
          </div>

          {/* 2. Next in Line */}
          <div className="p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{t.nextInLobby}</span>
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
              #{queue.nextSerial ? queue.nextSerial.toString().padStart(2, "0") : "--"}
            </div>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block">
              {queue.nextSerial
                ? (t("uiPleaseWaitInLobby"))
                : (t("uiNoPatientQueued"))}
            </span>
          </div>

          {/* 3. Previous Patient */}
          <div className="p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.previousPatient}</span>
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
              #{queue.previousSerial ? queue.previousSerial.toString().padStart(2, "0") : "--"}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
              {queue.previousSerial
                ? (t("uiCompleted"))
                : (t("uiFirstConsultation"))}
            </span>
          </div>

          {/* 4. Missed Serials */}
          <div className="p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>{t.missedSkippedCalls}</span>
            </span>
            {queue.missedSerials && queue.missedSerials.length > 0 ? (
              <div className="flex flex-wrap gap-1 pt-1">
                {queue.missedSerials.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-bold text-xs"
                  >
                    #{s.toString().padStart(2, "0")}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-3xl sm:text-4xl font-black text-slate-300 dark:text-slate-700 font-mono">
                0
              </div>
            )}
            <span className="text-[10px] text-slate-400 block">
              {queue.missedSerials && queue.missedSerials.length > 0
                ? t.reportToReceptionRequeue
                : t.zeroMissedCalls}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 border-t border-[var(--border-subtle)]">
          <span>
            {language === "bn"
              ? `আজ মোট বুককৃত রোগী: ${queue.total} (${queue.totalBooked} অপেক্ষমাণ, ${queue.totalCompleted} সম্পন্ন)`
              : `Total Patients Booked Today: ${queue.total} (${queue.totalBooked} waiting, ${queue.totalCompleted} completed)`}
          </span>
          <span className="text-[11px] text-slate-400">
            {t.safePublicDisplayNotice}
          </span>
        </div>
      </section>

      {/* Detailed Grid: Chamber Schedule, Consultation Info, Biography */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Column 1: Chamber Visiting Hours & Schedule */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-subtle)]">
            <span className="w-8 h-8 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("uiVisitingSchedule")}
              </h3>
              <p className="text-[11px] text-slate-500">
                {t("uiChamberConsultationHours")}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <DoctorScheduleDisplay
              schedule={doctor.scheduleJson as ScheduleData | null}
              visitingHours={doctor.visitingHours}
              chamber={doctor.chamberAddress}
              compact={false}
              showEmergencyNotice={true}
            />

            {doctor.chamberAddress && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  {t("uiChamberLocation")}
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{doctor.chamberAddress}</span>
                </p>
              </div>
            )}

            {/* Multi-Tier Consultation Fee & Visiting Policy */}
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t("uiConsultationFeesPolicy")}
              </span>
              
              <div className="space-y-1.5 rounded-2xl bg-[var(--bg-subtle)] p-3 border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    {t.firstVisit}:
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                    ${doctor.newPatientFee ?? 50}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    {t.followupVisit}:
                  </span>
                  <span className="font-bold text-[var(--brand-text)] font-mono">
                    ${doctor.followupFee ?? 30}{" "}
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({doctor.followupValidityDays ?? 90}{t("uiDValidity")})
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {t.reportReview}:
                  </span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    {t("uiFree")}{" "}
                    <span className="text-[10px] opacity-80 font-normal">
                      ({doctor.reportFreeDays ?? 2}{t("uiDWindow")})
                    </span>
                  </span>
                </div>
              </div>

              {doctor.consultationFee && (
                <p className="text-[11px] text-slate-500 italic">
                  {t("uiChamberNote")}{doctor.consultationFee}
                </p>
              )}
            </div>

            {doctor.contactNumber && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  {t("uiAppointmentPhone")}
                </span>
                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doctor.contactNumber}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Column 2 & 3: Biography & Verified Clinical Credentials */}
        <div className="md:col-span-2 space-y-6">
          {/* Biography */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>{t("uiAboutProfessionalExperience")}</span>
            </h3>

            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              {doctor.bio ? (
                <p className="whitespace-pre-line">{doctor.bio}</p>
              ) : (
                <p className="text-slate-400 italic">
                  {language === "bn"
                    ? `ডা. ${doctor.user.name} একজন ${doctor.specialization} বিশেষজ্ঞ${doctor.hospital ? ` যিনি ${doctor.hospital}-এ কর্মরত` : ""}। রোগী-কেন্দ্রিক নির্ভুল রোগ নির্ণয় এবং আধুনিক প্রেসক্রিপশনের জন্য পরিচিত।`
                    : `Dr. ${doctor.user.name} is a specialist in ${doctor.specialization}${doctor.hospital ? ` serving at ${doctor.hospital}` : ""}. Known for patient-centered clinical diagnosis, evidence-based medication protocols, and comprehensive follow-up care.`}
                </p>
              )}
            </div>
          </div>

          {/* Regulatory & Institutional Accreditation */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{t("uiAccreditationPracticeStandards")}</span>
            </h3>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    {t("uiBmdcRegistered")}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {t("uiLicensedPhysicianEligibleForOfficial")}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-start gap-2.5">
                <Activity className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    {t("uiDigitalVersionTracking")}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {t("uiAllPrescriptionsIssuedByThis")}
                  </p>
                </div>
              </div>
            </div>

            {doctor.signatureUrl && (
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {t("uiAuthorizedDigitalSignatureOnFile")}
                </span>
                <div className="px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={doctor.signatureUrl}
                    alt="Verified Signature"
                    className="h-7 w-auto object-contain dark:invert"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
