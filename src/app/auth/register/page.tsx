import { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSystemInstalled } from "@/features/setup/setup.service";
import { RegisterView } from "./register-view";

export const metadata: Metadata = {
  title: "Registration",
  description: "Register a new clinic or create a patient health account to access electronic prescriptions and manage doctor appointments.",
};

export default async function RegisterPage() {
  const installed = await isSystemInstalled();
  if (!installed) {
    redirect("/setup");
  }

  return <RegisterView />;
}
