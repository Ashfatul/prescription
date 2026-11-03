import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";
import { db } from "@/lib/db";
import { RoleName } from "@prisma/client";
import { isDemoModeActive } from "@/features/demo/demo-reset.service";
import { DemoCountdownTimer } from "@/components/common/demo-countdown-timer";
import { ClinicDetailsView } from "@/components/clinics/clinic-details-view";

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

  const isDemo = isDemoModeActive();
  const isDemoClinic = clinic ? (Boolean((clinic as { isDemo?: boolean }).isDemo) || clinic.slug === "ppms-clinic") : false;
  if (!clinic || clinic.status === "SUSPENDED" || (!isDemo && isDemoClinic)) {
    notFound();
  }

  // Separate staff members (STAFF & ADMIN) from doctors for dedicated clean sections
  const staffMembers = clinic.users
    .filter((u) => u.role.name === "STAFF" || u.role.name === "ADMIN")
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      imageUrl: u.imageUrl,
      role: { name: u.role.name },
    }));

  const clinicDoctors = clinic.doctors.map((d) => ({
    id: d.id,
    specialization: d.specialization,
    degrees: d.degrees,
    chamberAddress: d.chamberAddress,
    bmdcRegNo: d.bmdcRegNo,
    newPatientFee: d.newPatientFee,
    user: {
      name: d.user.name,
      imageUrl: d.user.imageUrl,
    },
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Header loggedIn={!!user} />

      <ClinicDetailsView
        clinic={{
          id: clinic.id,
          name: clinic.name,
          slug: clinic.slug,
          status: clinic.status,
          address: clinic.address,
          contactPhone: clinic.contactPhone,
          contactEmail: clinic.contactEmail,
          plan: clinic.plan ? { name: clinic.plan.name } : null,
          _count: {
            patients: clinic._count.patients,
            prescriptions: clinic._count.prescriptions,
          },
        }}
        staffMembers={staffMembers}
        clinicDoctors={clinicDoctors}
        isDemoClinic={isDemoClinic}
      />

      <DemoCountdownTimer variant="floating" />
      <Footer initialSettings={settings} />
    </div>
  );
}
