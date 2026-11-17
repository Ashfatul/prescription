"use client";

import { ErrorView } from "@/components/error/error-view";
import { useLanguage } from "@/lib/i18n/language-context";

export function UnauthorizedView() {
  const { t } = useLanguage();

  return (
    <ErrorView
      code="401"
      codeColor="warning"
      title={t.uiUnauthorizedTitle}
      description={t.uiUnauthorizedDesc}
    />
  );
}
