import { Metadata } from "next";
import { RegisterView } from "./register-view";

export const metadata: Metadata = {
  title: "Registration - CareFlow OS",
  description: "Register a new clinic or create a patient health account to access electronic prescriptions and manage doctor appointments.",
};

export default function RegisterPage() {
  return <RegisterView />;
}
