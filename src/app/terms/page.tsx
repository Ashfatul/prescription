import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TermsView } from "@/components/legal/terms-view";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";

export const metadata: Metadata = {
  title: "Terms of Service Agreement | PPMS",
  description: "Terms of Service and Clinical Platform Usage Agreement for Patient Prescription Management System.",
};

export default async function TermsPage() {
  const [user, settings] = await Promise.all([
    getCurrentUserFromCookie(),
    getHospitalSettings(),
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Header loggedIn={!!user} />
      <TermsView />
      <Footer initialSettings={settings} />
    </div>
  );
}