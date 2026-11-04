import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StaffHero } from "@/components/staff/staff-hero";
import { StaffDirectory, StaffMember } from "@/components/staff/staff-directory";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";
import { db } from "@/lib/db";
import { RoleName } from "@prisma/client";

export const metadata: Metadata = {
  title: "Clinical Staff & Healthcare Team Directory | PPMS",
  description: "Browse registered hospital receptionists, front-desk triage staff, clinic administrators, and clinical coordinators on CareFlow OS.",
};

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const [user, settings, staffRecords, orgs] = await Promise.all([
    getCurrentUserFromCookie(),
    getHospitalSettings(),
    db.user.findMany({
      where: {
        role: {
          name: { in: [RoleName.STAFF, RoleName.ADMIN, RoleName.DOCTOR] },
        },
        organization: {
          status: { not: "SUSPENDED" },
        },
      },
      include: {
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            contactPhone: true,
          },
        },
        doctor: {
          select: {
            specialization: true,
            degrees: true,
            designation: true,
            visitingHours: true,
            chamberAddress: true,
            available: true,
          },
        },
      },
      orderBy: [{ name: "asc" }],
    }),
    db.organization.findMany({
      where: { status: { not: "SUSPENDED" } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const staff: StaffMember[] = staffRecords.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    imageUrl: item.imageUrl,
    role: item.role.name as StaffMember["role"],
    createdAt: item.createdAt.toISOString(),
    organization: item.organization,
    doctor: item.doctor,
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Header loggedIn={!!user} />

      <main className="flex-1 w-full">
        {/* Top Directory Hero Banner */}
        <StaffHero
          staffCount={staff.length}
          clinicsCount={orgs.length}
          emergencyHotline={settings.emergencyHotline}
        />

        {/* Directory Content Area */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <StaffDirectory initialStaff={staff} clinics={orgs} />
        </section>
      </main>

      <Footer initialSettings={settings} />
    </div>
  );
}
