import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { env } from "@/lib/env";
import { Providers } from "@/components/layout/providers";
import { getCurrentUserFromCookie } from "@/lib/auth/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${env.appName} | Patient Prescription Management System`,
  description: "A full-stack prescription and appointment management system.",
};

function ThemeScript() {
  const code = `(function(){try{var a=localStorage.getItem("ppms-accent");if(a&&a!=="teal"){document.documentElement.setAttribute("data-accent",a)}else if(a==="teal"){document.documentElement.removeAttribute("data-accent")}var t=localStorage.getItem("theme");var d=t==="dark"||((!t||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d){document.documentElement.classList.add("dark")}else{document.documentElement.classList.remove("dark")}}catch(e){}})()`;
  return <script id="ppms-theme-script" dangerouslySetInnerHTML={{ __html: code }} />;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const user = await getCurrentUserFromCookie();

  const safeUser = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
        theme: user.theme || "system",
        accent: user.accent || "teal",
        doctor: user.doctor
          ? { id: user.doctor.id, specialization: user.doctor.specialization }
          : null,
        patient: user.patient ? { id: user.patient.id } : null,
      }
    : null;

  const initialAccent =
    safeUser?.accent || cookieStore.get("ppms_accent")?.value || "teal";
  const initialTheme =
    safeUser?.theme || cookieStore.get("ppms_theme")?.value || "system";

  const isServerDark = initialTheme === "dark";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-accent={initialAccent !== "teal" ? initialAccent : undefined}
      className={`${geistSans.variable} ${geistMono.variable} ${isServerDark ? "dark " : ""}h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <Providers
          initialUser={safeUser}
          initialAccent={initialAccent}
          initialTheme={initialTheme}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
