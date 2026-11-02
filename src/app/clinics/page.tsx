import { Metadata } from "next";
import Link from "next/link";
import { 
  Building2, 
  ArrowLeft, 
  Clock, 
  PhoneCall, 
  Activity, 
  ShieldCheck, 
  Stethoscope, 
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ClinicDirectory, ClinicItem } from "@/components/clinics/clinic-directory";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";
import { isDemoModeActive } from "@/features/demo/demo-reset.service";
import { DemoCountdownTimer } from "@/components/common/demo-countdown-timer";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Registered Clinics & Medical Centers Directory | PPMS",
  description: "Browse accredited polyclinics, specialized chambers, hospitals, and verified consulting physicians on PPMS Clinical OS.",
};

export const dynamic = "force-dynamic";

export default async function ClinicsPage() {
  const isDemoMode = isDemoModeActive();

  const [user, settings, orgs] = await Promise.all([
    getCurrentUserFromCookie(),
    getHospitalSettings(),
    db.organization.findMany({
      where: {
        status: { not: "SUSPENDED" },
        ...(isDemoMode ? {} : { slug: { not: "ppms-clinic" } }),
      },
      include: {
        plan: true,
        _count: {
          select: {
            doctors: true,
            patients: true,
            appointments: true,
            prescriptions: true,
          },
        },
        doctors: {
          include: {
            user: {
              select: {
                name: true,
                imageUrl: true,
                email: true,
              },
            },
          },
          take: 4,
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  // Transform records safely for client rendering
  const clinics: ClinicItem[] = orgs.map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    status: org.status as ClinicItem["status"],
    isDemo: Boolean((org as { isDemo?: boolean }).isDemo) || org.slug === "ppms-clinic",
    contactEmail: org.contactEmail,
    contactPhone: org.contactPhone,
    address: org.address,
    logoUrl: org.logoUrl,
    createdAt: org.createdAt.toISOString(),
    plan: org.plan
      ? {
          id: org.plan.id,
          name: org.plan.name,
          price: org.plan.price,
          billingCycle: org.plan.billingCycle,
          description: org.plan.description,
        }
      : null,
    _count: org._count,
    doctors: org.doctors.map((doc) => ({
      id: doc.id,
      specialization: doc.specialization,
      degrees: doc.degrees,
      chamberAddress: doc.chamberAddress,
      available: doc.available,
      user: {
        name: doc.user.name,
        imageUrl: doc.user.imageUrl,
        email: doc.user.email,
      },
    })),
  }));

  const totalDoctors = clinics.reduce((acc, c) => acc + c._count.doctors, 0);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Header loggedIn={!!user} />

      <main className="flex-1 w-full">
        {/* Top Directory Hero Banner */}
        <section className="w-full border-b border-[var(--border-subtle)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(15,118,110,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(20,184,166,0.14),transparent)]">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/" className="hover:text-[var(--brand-text)] flex items-center gap-1 transition">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <span>/</span>
              <span className="font-semibold text-[var(--text-primary)]">Clinics & Polyclinics</span>
            </div>

            {/* Title & Live Status Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] text-xs font-bold uppercase tracking-wider border border-[var(--brand-border)]">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Accredited Healthcare Network</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  Registered Clinics & Polyclinics
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Explore verified multi-doctor chambers, polyclinics, and diagnostic facilities operating on the PPMS Clinical Suite. Find chamber addresses, hotlines, and consult licensed physicians.
                </p>
              </div>

              {/* Dynamic Clinic Metrics Badges */}
              <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>{clinics.length} Verified {clinics.length === 1 ? "Clinic" : "Clinics"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Stethoscope className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>Practicing Specialists: <strong className="text-[var(--text-primary)]">{totalDoctors}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>Emergency Service: <strong className="text-[var(--text-primary)]">{settings.emergencyHotline}</strong></span>
                </div>
              </div>
            </div>

            {/* Regulatory Assurance Strip */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>BMDC Regulated & HIPAA Aligned Chambers</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>Live Patient Queue Calling Screens</span>
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
          <ClinicDirectory initialClinics={clinics} />
        </section>
      </main>

      <DemoCountdownTimer variant="floating" />
      <Footer initialSettings={settings} />
    </div>
  );
}
