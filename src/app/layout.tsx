import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f766e" },
    { media: "(prefers-color-scheme: dark)", color: "#080c15" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: `${env.appName} | Patient Prescription Management System`,
  description: "A full-stack multi-clinic prescription and appointment management system.",
  manifest: "/manifest.webmanifest",
  applicationName: "CareFlow OS",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: env.appName,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

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
