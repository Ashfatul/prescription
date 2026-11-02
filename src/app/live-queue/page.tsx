import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HospitalQueueDisplay } from "@/components/queue/hospital-queue-display";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { DemoCountdownTimer } from "@/components/common/demo-countdown-timer";

export const metadata: Metadata = {
  title: "Live OPD Chamber Calling Monitor | Patient Queue Display",
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
  const [currentUser, sParams] = await Promise.all([
    getCurrentUserFromCookie(),
    searchParams ? await searchParams : Promise.resolve({} as SearchParams),
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Header loggedIn={!!currentUser} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <HospitalQueueDisplay initialDoctorId={sParams?.doctorId} clinicSlug={sParams?.clinic} />
      </main>

      <DemoCountdownTimer variant="floating" />
      <Footer />
    </div>
  );
}
