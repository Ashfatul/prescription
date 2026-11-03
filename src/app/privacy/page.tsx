import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PrivacyView } from "@/components/legal/privacy-view";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";

export const metadata: Metadata = {
  title: "Privacy Policy & Health Data Protection | PPMS",
  description: "Comprehensive privacy and clinical health data governance policy for Patient Prescription Management System.",
};

export default async function PrivacyPage() {
  const [user, settings] = await Promise.all([
    getCurrentUserFromCookie(),
    getHospitalSettings(),
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Header loggedIn={!!user} />
      <PrivacyView settings={settings} />
      <Footer initialSettings={settings} />
    </div>
  );
}