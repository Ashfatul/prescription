import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DoctorList } from "@/components/home/doctor-list";
import { DoctorsHero } from "@/components/doctors/doctors-hero";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";
import { DemoCountdownTimer } from "@/components/common/demo-countdown-timer";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Consulting Physicians & Specialists Directory | PPMS",
  description: "Browse registered hospital physicians, specialist chambers, visiting hours, and real-time live serial queues.",
};

export const dynamic = "force-dynamic";

interface DoctorsPageProps {
  searchParams?: Promise<{
    clinic?: string;
    search?: string;
  }>;
}

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const [user, settings, sParams] = await Promise.all([
    getCurrentUserFromCookie(),
    getHospitalSettings(),
    searchParams ? await searchParams : Promise.resolve({} as { clinic?: string; search?: string }),
  ]);

  const clinicSlug = sParams?.clinic;
  const clinic = clinicSlug
    ? await db.organization.findUnique({
        where: { slug: clinicSlug },
        select: { name: true, slug: true, address: true },
      })
    : null;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Header loggedIn={!!user} />

      <main className="flex-1 w-full">
        {/* Top Directory Hero Banner */}
        <DoctorsHero
          clinic={clinic}
          hospitalName={settings.hospitalName}
          emergencyStatus={settings.emergencyStatus}
          opdVisitingHours={settings.opdVisitingHours}
          chamberDays={settings.chamberDays}
          emergencyHotline={settings.emergencyHotline}
        />

        {/* Directory Content Area */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <DoctorList initialLimit={9} clinicSlug={clinicSlug} />
        </section>
      </main>

      <DemoCountdownTimer variant="floating" />
      <Footer initialSettings={settings} />
    </div>
  );
}
