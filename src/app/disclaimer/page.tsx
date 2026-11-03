import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DisclaimerView } from "@/components/legal/disclaimer-view";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";

export const metadata: Metadata = {
  title: "Medical Disclaimer & Clinical Prescribing Standards | PPMS",
  description: "Official medical disclaimer and clinical prescribing standards for the Patient Prescription Management System.",
};

export default async function DisclaimerPage() {
  const [user, settings] = await Promise.all([
    getCurrentUserFromCookie(),
    getHospitalSettings(),
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Header loggedIn={!!user} />
      <DisclaimerView settings={settings} />
      <Footer initialSettings={settings} />
    </div>
  );
}