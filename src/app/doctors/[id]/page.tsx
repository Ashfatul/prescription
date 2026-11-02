import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Stethoscope,
  ArrowLeft,
  Clock,
  PhoneCall,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Award,
  DollarSign,
  Building2,
  Activity,
} from "lucide-react";
import { RoleName } from "@prisma/client";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getDoctorQueue } from "@/features/doctors/doctor.service";
import { DoctorBookingButton } from "./doctor-booking-button";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const doctor = await db.doctor.findUnique({
    where: { id },
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  if (!doctor) {
    return { title: "Doctor Profile | PPMS" };
  }

  return {
    title: `${doctor.user.name} - ${doctor.specialization} | Specialist Profile`,
    description: `View chamber schedule, credentials, BMDC registration, and book consultation with ${doctor.user.name} (${doctor.specialization}).`,
  };
}

export default async function DoctorDetailPage({ params }: Props) {
  const { id } = await params;

  const [currentUser, doctor] = await Promise.all([
    getCurrentUserFromCookie(),
    db.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    }),
  ]);

  if (!doctor) {
    notFound();
  }

  const queue = await getDoctorQueue(doctor.id);

  const userRole = currentUser?.role?.name;
  const isDoctorRole = userRole === RoleName.DOCTOR;
  const isStaffRole = userRole === RoleName.STAFF || userRole === RoleName.SUPER_ADMIN;
  const canBook = !currentUser || userRole === RoleName.PATIENT;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Header loggedIn={!!currentUser} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/doctors"
            className="hover:text-[var(--brand-text)] flex items-center gap-1.5 transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Specialists Directory</span>
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
                    <span>{doctor.available ? "Chamber Open" : "Chamber Paused / Away"}</span>
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
                      <span>BMDC Reg: {doctor.bmdcRegNo}</span>
                    </span>
                  )}
                  {doctor.experienceYears && (
                    <span className="flex items-center gap-1 font-medium">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>Experience: {doctor.experienceYears}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Live Queue Badge & Action */}
            <div className="w-full md:w-auto p-5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-3 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Live Outpatient Queue
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-[var(--brand-text)]">
                    #{queue.currentSerial || "1"}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Currently in Chamber</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Total Patients Booked Today: <strong>{queue.total}</strong>
                </p>
              </div>

              {canBook ? (
                <DoctorBookingButton doctorId={doctor.id} doctorName={doctor.user.name} />
              ) : isDoctorRole ? (
                <div className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 text-center">
                  Logged in as Doctor
                </div>
              ) : isStaffRole ? (
                <div className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 text-center">
                  Logged in as Administrative Staff
                </div>
              ) : null}
            </div>
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
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Visiting Schedule</h3>
                <p className="text-[11px] text-slate-500">Chamber consultation hours</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Chamber Days & Time:
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {doctor.visitingHours || "Sat - Thu: 5:00 PM - 9:00 PM (Weekly)"}
                </p>
              </div>

              {doctor.chamberAddress && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Chamber Location:
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{doctor.chamberAddress}</span>
                  </p>
                </div>
              )}

              {doctor.consultationFee && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Consultation Fee:
                  </span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>{doctor.consultationFee}</span>
                  </p>
                </div>
              )}

              {doctor.contactNumber && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Appointment Phone:
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
                <span>About & Professional Experience</span>
              </h3>

              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                {doctor.bio ? (
                  <p className="whitespace-pre-line">{doctor.bio}</p>
                ) : (
                  <p className="text-slate-400 italic">
                    Dr. {doctor.user.name} is a specialist in {doctor.specialization} serving at {doctor.hospital || "Metropolitan Specialized Hospital"}. Known for patient-centered clinical diagnosis, evidence-based medication protocols, and comprehensive follow-up care.
                  </p>
                )}
              </div>
            </div>

            {/* Regulatory & Institutional Accreditation */}
            <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Accreditation & Practice Standards</span>
              </h3>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">BMDC Registered</h4>
                    <p className="text-[11px] text-slate-500">
                      Licensed physician eligible for official computerized digital prescriptions.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-start gap-2.5">
                  <Activity className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Digital Version Tracking</h4>
                    <p className="text-[11px] text-slate-500">
                      All prescriptions issued by this physician support version history and lab report follow-ups.
                    </p>
                  </div>
                </div>
              </div>

              {doctor.signatureUrl && (
                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">Authorized Digital Signature on File:</span>
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

      <Footer />
    </div>
  );
}
