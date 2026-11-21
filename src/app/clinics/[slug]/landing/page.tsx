import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ClinicLandingView } from "@/components/clinics/clinic-landing-view";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";
import { db } from "@/lib/db";

interface ClinicLandingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ClinicLandingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const clinic = await db.organization.findUnique({
    where: { slug },
    select: { name: true, address: true },
  });

  if (!clinic) {
    return { title: "Clinic Not Found" };
  }

  return {
    title: `${clinic.name} | Official Clinic Landing Page`,
    description: `Meet the specialists, explore services and book an appointment at ${clinic.name}. ${clinic.address || ""}`,
  };
}

export const dynamic = "force-dynamic";

export default async function ClinicLandingPage({ params }: ClinicLandingPageProps) {
  const { slug } = await params;

  const [user, settings, clinic] = await Promise.all([
    getCurrentUserFromCookie(),
    getHospitalSettings(),
    db.organization.findUnique({
    where: { slug },
    include: {
      plan: true,
      doctors: {
        include: {
          user: {
            select: {
              name: true,
              imageUrl: true,
            },
          },
        },
        orderBy: [{ available: "desc" }, { createdAt: "asc" }],
      },
      _count: {
        select: {
          doctors: true,
          patients: true,
          prescriptions: true,
          appointments: true,
        },
        },
      },
    }),
  ]);

  if (!clinic || clinic.status === "SUSPENDED") {
    notFound();
  }

  const doctors = clinic.doctors.map((doc) => ({
    id: doc.id,
    specialization: doc.specialization,
    degrees: doc.degrees,
    chamberAddress: doc.chamberAddress,
    bmdcRegNo: doc.bmdcRegNo,
    newPatientFee: doc.newPatientFee,
    available: doc.available,
    user: {
      name: doc.user.name,
      imageUrl: doc.user.imageUrl,
    },
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Header loggedIn={!!user} initialSettings={settings} />

      <ClinicLandingView
        clinic={{
          id: clinic.id,
          name: clinic.name,
          slug: clinic.slug,
          status: clinic.status,
          address: clinic.address,
          contactPhone: clinic.contactPhone,
          contactEmail: clinic.contactEmail,
          logoUrl: clinic.logoUrl,
          planName: clinic.plan ? clinic.plan.name : null,
          _count: clinic._count,
        }}
        doctors={doctors}
      />

      <Footer initialSettings={settings} />
    </div>
  );
}
