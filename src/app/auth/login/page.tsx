import { redirect } from "next/navigation";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getCurrentUserFromCookie();
  if (user) {
    redirect("/dashboard");
  }

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  return <LoginForm isDemoMode={isDemoMode} />;
}
