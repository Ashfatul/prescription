"use client";

import { useState } from "react";
import { RegisterForm } from "./register-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterCompanion } from "@/components/auth/register-companion";
import { useLanguage } from "@/lib/i18n/language-context";

export function RegisterView() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"clinic" | "patient">("clinic");
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");

  return (
    <AuthShell
      activeBadge={mode === "clinic" ? t("uiClinicPatientOnboarding") : t("uiPatientPortal")}
      deckMaxWidth="max-w-6xl"
      companion={
        <RegisterCompanion
          mode={mode}
          clinicSlug={slug}
          slugStatus={slugStatus}
        />
      }
    >
      <RegisterForm
        onModeChange={(m) => setMode(m)}
        onSlugChange={(s, status) => {
          setSlug(s);
          setSlugStatus(status);
        }}
      />
    </AuthShell>
  );
}
