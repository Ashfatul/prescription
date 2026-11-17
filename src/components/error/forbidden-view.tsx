"use client";

import { ErrorView } from "@/components/error/error-view";
import { useLanguage } from "@/lib/i18n/language-context";

export function ForbiddenView() {
  const { t } = useLanguage();

  return (
    <ErrorView
      code="403"
      codeColor="rose"
      title={t.uiForbiddenTitle}
      description={t.uiForbiddenDesc}
    />
  );
}
