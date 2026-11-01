import { Metadata } from "next";
import { RegisterForm } from "./register-form";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getHospitalSettings } from "@/features/settings/settings.service";

export const metadata: Metadata = {
  title: "Patient Registration - PPMS Clinical Suite",
  description: "Register as a patient to access your electronic prescriptions, lab reports, and doctor appointments.",
};

export default async function RegisterPage() {
  const settings = await getHospitalSettings();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col justify-between">
      <Header loggedIn={false} />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <RegisterForm />
      </main>
      <Footer initialSettings={settings} />
    </div>
  );
}
