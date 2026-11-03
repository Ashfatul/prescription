import { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoleName } from "@prisma/client";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getDoctorQueue } from "@/features/doctors/doctor.service";
import { DoctorProfileView } from "@/components/doctors/doctor-profile-view";

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

      <DoctorProfileView
        doctor={{
          id: doctor.id,
          specialization: doctor.specialization,
          degrees: doctor.degrees,
          designation: doctor.designation,
          hospital: doctor.hospital,
          bmdcRegNo: doctor.bmdcRegNo,
          experienceYears: doctor.experienceYears,
          available: doctor.available,
          chamberAddress: doctor.chamberAddress,
          contactNumber: doctor.contactNumber,
          bio: doctor.bio,
          newPatientFee: doctor.newPatientFee,
          followupFee: doctor.followupFee,
          followupValidityDays: doctor.followupValidityDays,
          reportFreeDays: doctor.reportFreeDays,
          consultationFee: doctor.consultationFee,
          visitingHours: doctor.visitingHours,
          signatureUrl: doctor.signatureUrl,
          scheduleJson: doctor.scheduleJson,
          user: {
            name: doctor.user.name,
            email: doctor.user.email,
            imageUrl: doctor.user.imageUrl,
          },
        }}
        queue={queue}
        canBook={canBook}
        isDoctorRole={isDoctorRole}
        isStaffRole={isStaffRole}
      />

      <Footer />
    </div>
  );
}
