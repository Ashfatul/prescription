"use client";

import { AlertCircle } from "lucide-react";
import { Card } from "@/components/common/card";
import { useLanguage } from "@/lib/i18n/language-context";

export function DoctorNotFoundCard() {
  const { t, language } = useLanguage();

  return (
    <Card className="max-w-xl mx-auto my-12 p-8 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
        <AlertCircle className="w-7 h-7" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {t("roleDoctorProfileNotFound")}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {t("uiYourUserAccountIsNot")}
        </p>
      </div>
    </Card>
  );
}
