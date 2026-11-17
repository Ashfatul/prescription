import { redirect } from "next/navigation";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { isSystemInstalled } from "@/features/setup/setup.service";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const installed = await isSystemInstalled();
  if (!installed) {
    redirect("/setup");
  }

  const user = await getCurrentUserFromCookie();
  if (user) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
