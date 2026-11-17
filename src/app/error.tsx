"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/error/error-view";
import { useLanguage } from "@/lib/i18n/language-context";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <ErrorView
      code="500"
      codeColor="danger"
      title={t.uiSystemErrorTitle}
      description={t.uiSystemErrorDesc}
      onReset={reset}
    />
  );
}
