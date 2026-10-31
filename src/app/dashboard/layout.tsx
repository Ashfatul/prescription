import { Header } from "@/components/layout/header";
import { requirePageUser } from "@/lib/auth/page-auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requirePageUser();

  return (
    <div className="min-h-screen app-gradient">
      <Header loggedIn />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
