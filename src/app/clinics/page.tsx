import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ClinicsHero } from "@/components/clinics/clinics-hero";
import { ClinicDirectory, ClinicItem } from "@/components/clinics/clinic-directory";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";
import { isDemoModeActive } from "@/features/demo/demo-reset.service";
import { DemoCountdownTimer } from "@/components/common/demo-countdown-timer";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Registered Clinics & Medical Centers Directory | PPMS",
  description: "Browse accredited polyclinics, specialized chambers, hospitals, and verified consulting physicians on CareFlow OS.",
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
        <ClinicsHero
          clinicsCount={clinics.length}
          totalDoctors={totalDoctors}
          emergencyHotline={settings.emergencyHotline}
        />

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
