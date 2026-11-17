"use client";

import { ErrorView } from "@/components/error/error-view";
import { useLanguage } from "@/lib/i18n/language-context";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <ErrorView
      code="404"
      codeColor="brand"
      title={t.uiPageNotFoundTitle}
      description={t.uiPageNotFoundDesc}
    />
  );
}
