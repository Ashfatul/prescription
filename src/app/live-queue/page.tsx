import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HospitalQueueDisplay } from "@/components/queue/hospital-queue-display";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";
import { isSystemInstalled } from "@/features/setup/setup.service";

export const metadata: Metadata = {
  title: "Live OPD Chamber Calling Monitor",
  description:
    "Real-time live outpatient consultation queue monitor. View now-calling tokens, next in line, and missed serials across all consulting chambers.",
};

type SearchParams = {
  doctorId?: string;
  clinic?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

export default async function LiveQueuePage({ searchParams }: Props) {
  const installed = await isSystemInstalled();
  if (!installed) {
    redirect("/setup");
  }

  const [currentUser, settings, sParams] = await Promise.all([
    getCurrentUserFromCookie(),
    getHospitalSettings(),
    searchParams ? await searchParams : Promise.resolve({} as SearchParams),
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Header loggedIn={!!currentUser} initialSettings={settings} />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <HospitalQueueDisplay initialDoctorId={sParams?.doctorId} clinicSlug={sParams?.clinic} />
      </main>

      <Footer initialSettings={settings} />
    </div>
  );
}
