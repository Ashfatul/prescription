import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HomeView } from "@/components/home/home-view";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";
import { listPricingPlans } from "@/features/pricing/pricing.service";
import { isSystemInstalled } from "@/features/setup/setup.service";
import { db } from "@/lib/db";

export default async function Home() {
  const installed = await isSystemInstalled();
  if (!installed) {
    redirect("/setup");
  }

  const [
    user,
    settings,
    rawPlans,
    totalDoctors,
    totalPrescriptions,
    totalClinics,
    totalMedicines,
  ] = await Promise.all([
    getCurrentUserFromCookie().catch(() => null),
    getHospitalSettings(),
    listPricingPlans(true),
    db.doctor
      .count({
        where: { available: true },
      })
      .catch((err) => {
        console.error("Failed to count doctors:", err);
        return 0;
      }),
    db.prescription
      .count()
      .catch((err) => {
        console.error("Failed to count prescriptions:", err);
        return 0;
      }),
    db.organization
      .count({
        where: { status: "ACTIVE" },
      })
      .catch((err) => {
        console.error("Failed to count clinics:", err);
        return 0;
      }),
    db.medicine.count().catch((err) => {
      console.error("Failed to count medicines:", err);
      return 0;
    }),
  ]);
  const isLoggedIn = !!user;

  const pricingPlans = rawPlans.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    billingCycle: p.billingCycle,
    description: p.description,
    features: Array.isArray(p.features) ? (p.features as string[]) : [],
    isPopular: p.isPopular,
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] selection:bg-[var(--brand-primary)] selection:text-white flex flex-col">
      {/* Front Page Header */}
      <Header loggedIn={isLoggedIn} initialSettings={settings} />

      {/* Fully Localized Interactive Home View */}
      <HomeView
        user={
          user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                role:
                  typeof user.role === "string"
                    ? user.role
                    : (user.role as { name?: string })?.name || "DOCTOR",
              }
            : null
        }
        settings={settings}
        pricingPlans={pricingPlans}
        totalDoctors={totalDoctors}
        totalPrescriptions={totalPrescriptions}
        totalClinics={totalClinics}
        totalMedicines={totalMedicines}
      />

      {/* Modern Clinical Multi-Column Footer */}
      <Footer initialSettings={settings} />
    </div>
  );
}
