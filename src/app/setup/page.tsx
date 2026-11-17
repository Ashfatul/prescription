"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Database,
  Building,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Users,
  FileText,
  LayoutDashboard,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { CustomSelect } from "@/components/common/custom-select";
import { LanguageToggle } from "@/components/common/language-toggle";
import { ThemeCustomizer } from "@/components/common/theme-customizer";

interface SetupResult {
  user: {
    id: string;
    name: string;
    email: string;
  };
  systemName: string;
  verificationToken: string;
  verifyUrl: string;
  emailSent: boolean;
  smtpError?: string;
}

export default function SetupPage() {
  const { t } = useLanguage();

  // Status & Step
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyInstalled, setAlreadyInstalled] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | undefined>(undefined);
  const [dbError, setDbError] = useState<string | null>(null);

  // Form Fields - Step 2: Platform Identity
  const [systemName, setSystemName] = useState("CareFlow Health");
  const [systemTagline, setSystemTagline] = useState("Clinical Prescribing & Hospital Management System");
  const [supportEmail, setSupportEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("+880 1700-000000");
  const [emergencyHotline, setEmergencyHotline] = useState("10655");
  const [currency, setCurrency] = useState("BDT");
  const [timezone, setTimezone] = useState("Asia/Dhaka");

  // Form Fields - Step 3: Root Super Admin
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Completed Setup Result - Step 4
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const res = await fetch("/api/setup/status", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.isInstalled) {
          setAlreadyInstalled(true);
        } else {
          setDbConnected(data.data.dbConnected);
          setLatencyMs(data.data.latencyMs);
          if (!data.data.dbConnected) {
            setDbError(data.data.error || "Database is unreachable.");
          }
        }
      } else {
        setDbError(data.message || "Failed to query system status.");
      }
    } catch (err: unknown) {
      setDbError(err instanceof Error ? err.message : "Network error checking system status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const initCheck = async () => {
      try {
        const res = await fetch("/api/setup/status", { cache: "no-store" });
        const data = await res.json();
        if (!mounted) return;
        if (data.success && data.data) {
          if (data.data.isInstalled) {
            setAlreadyInstalled(true);
          } else {
            setDbConnected(data.data.dbConnected);
            setLatencyMs(data.data.latencyMs);
            if (!data.data.dbConnected) {
              setDbError(data.data.error || "Database is unreachable.");
            }
          }
        } else {
          setDbError(data.message || "Failed to query system status.");
        }
      } catch (err: unknown) {
        if (mounted) {
          setDbError(err instanceof Error ? err.message : "Network error checking system status.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    initCheck();
    return () => {
      mounted = false;
    };
  }, []);

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemName.trim()) {
      setFormError("System or Hospital name is required.");
      return;
    }
    setFormError(null);
    setStep(3);
  };

  const handleBootstrapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!adminName.trim()) {
      setFormError("Administrator name is required.");
      return;
    }
    if (!adminEmail.trim()) {
      setFormError("Administrator email is required.");
      return;
    }
    if (adminPassword.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (adminPassword !== confirmPassword) {
      setFormError(t.uiPasswordMismatch);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemName,
          systemTagline,
          supportEmail: supportEmail || adminEmail,
          contactPhone,
          emergencyHotline,
          defaultCurrency: currency,
          defaultTimezone: timezone,
          adminName,
          adminEmail,
          adminPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormError(json.error || json.message || "Setup failed to complete.");
        setSubmitting(false);
        return;
      }

      setSetupResult(json.data);
      setStep(4);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Network error completing setup.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyVerifyLink = async () => {
    if (!setupResult?.verifyUrl) return;
    try {
      await navigator.clipboard.writeText(setupResult.verifyUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  // If already installed, show locked message
  if (alreadyInstalled) {
    return (
      <main className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex items-center justify-center p-4 sm:p-6 transition-colors">
        <div className="w-full max-w-md rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 sm:p-10 shadow-card text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
            {t.uiSystemAlreadyInstalled}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-8">
            {t.uiSystemAlreadyInstalledDesc}
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-2xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98] min-h-[46px]"
          >
            <span>{t.uiGoToLogin}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col transition-colors">
      {/* Top Header Bar */}
      <header className="w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-teal-700 flex items-center justify-center text-white shadow-md shadow-[var(--brand-primary)]/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
                CareFlow
              </span>
              <span className="text-[10px] font-semibold text-[var(--text-muted)] -mt-1 block tracking-wider uppercase">
                Clinical OS Setup
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <ThemeCustomizer compact direction="down" align="right" />
          </div>
        </div>
      </header>

      {/* Main Setup Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* Step Indicator Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] mb-1">
            {t.uiSetupWizardTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            {t.uiSetupWizardSubtitle}
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
            {[
              { num: 1, label: t.uiStep1Database },
              { num: 2, label: t.uiStep2SystemIdentity },
              { num: 3, label: t.uiStep3SuperAdmin },
              { num: 4, label: t.uiStep5Launchpad },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                  step === s.num
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : step > s.num
                    ? "bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)]"
                    : "bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-black/10 dark:bg-white/10">
                  {step > s.num ? "✓" : s.num}
                </span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Card Container */}
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-10 shadow-card">
          {/* STEP 1: Database Health */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-subtle)]">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-surface)] border border-[var(--brand-border)] flex items-center justify-center text-[var(--brand-primary)]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    {t.uiStep1Database}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    PostgreSQL connection and migration readiness.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <RotateCw className="w-8 h-8 text-[var(--brand-primary)] animate-spin" />
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    {t.uiCheckingDatabase}
                  </p>
                </div>
              ) : dbConnected ? (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        {t.uiDatabaseConnected}
                      </h3>
                      <p className="text-xs text-emerald-600/90 dark:text-emerald-400/90 mt-1 leading-relaxed">
                        {t.uiDatabaseConnectedDesc}
                      </p>
                      {latencyMs !== undefined && (
                        <p className="text-[11px] font-mono text-emerald-600/80 dark:text-emerald-400/80 mt-2">
                          Latency: {latencyMs}ms • Driver: PostgreSQL Prisma
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-semibold text-sm shadow-md shadow-[var(--brand-primary)]/20 transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer min-h-[46px]"
                    >
                      <span>{t.uiContinueToNext}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3.5">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-red-700 dark:text-red-300">
                        {t.uiDatabaseNotConnected}
                      </h3>
                      <p className="text-xs text-red-600/90 dark:text-red-400/90 mt-1 leading-relaxed">
                        {t.uiDatabaseErrorDesc}
                      </p>
                      {dbError && (
                        <pre className="text-[11px] font-mono bg-black/10 dark:bg-black/30 p-2.5 rounded-xl text-red-600 dark:text-red-400 mt-2.5 whitespace-pre-wrap break-all">
                          {dbError}
                        </pre>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={fetchStatus}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer min-h-[46px]"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>{t.uiRetryConnection}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: System Identity */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-subtle)]">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-surface)] border border-[var(--brand-border)] flex items-center justify-center text-[var(--brand-primary)]">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    {t.uiStep2SystemIdentity}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Configure your hospital or medical chamber platform parameters.
                  </p>
                </div>
              </div>

              {formError && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    {t.uiSystemNameLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    placeholder={t.uiSystemNamePlaceholder}
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    {t.uiSystemTaglineLabel}
                  </label>
                  <input
                    type="text"
                    value={systemTagline}
                    onChange={(e) => setSystemTagline(e.target.value)}
                    placeholder={t.uiSystemTaglinePlaceholder}
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    {t.uiSupportEmailLabel}
                  </label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder={t.uiSupportEmailPlaceholder}
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    {t.uiContactPhoneLabel}
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    {t.uiEmergencyHotlineLabel}
                  </label>
                  <input
                    type="text"
                    value={emergencyHotline}
                    onChange={(e) => setEmergencyHotline(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <CustomSelect
                    label={t.uiCurrencyLabel}
                    value={currency}
                    onChange={(val) => setCurrency(val)}
                    options={[
                      { value: "BDT", label: "BDT (৳) - Bangladeshi Taka" },
                      { value: "USD", label: "USD ($) - US Dollar" },
                      { value: "EUR", label: "EUR (€) - Euro" },
                      { value: "GBP", label: "GBP (£) - British Pound" },
                      { value: "INR", label: "INR (₹) - Indian Rupee" },
                    ]}
                    allowClear={false}
                    searchable={false}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <CustomSelect
                    label={t.uiTimezoneLabel}
                    value={timezone}
                    onChange={(val) => setTimezone(val)}
                    options={[
                      { value: "Asia/Dhaka", label: "Asia/Dhaka (GMT+6)" },
                      { value: "UTC", label: "UTC (Coordinated Universal Time)" },
                      { value: "America/New_York", label: "America/New_York (EST/EDT)" },
                      { value: "Europe/London", label: "Europe/London (GMT/BST)" },
                      { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
                      { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
                    ]}
                    allowClear={false}
                    searchable={true}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] font-medium text-sm transition-all cursor-pointer min-h-[46px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.uiGoBack}</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-semibold text-sm shadow-md shadow-[var(--brand-primary)]/20 transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer min-h-[46px]"
                >
                  <span>{t.uiContinueToNext}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Root Super Admin */}
          {step === 3 && (
            <form onSubmit={handleBootstrapSubmit} className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-subtle)]">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-surface)] border border-[var(--brand-border)] flex items-center justify-center text-[var(--brand-primary)]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    {t.uiStep3SuperAdmin}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Create the master administrator account. This will have full system authority.
                  </p>
                </div>
              </div>

              {formError && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    {t.uiAdminNameLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder={t.uiAdminNamePlaceholder}
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    {t.uiAdminEmailLabel} *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder={t.uiAdminEmailPlaceholder}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                    />
                    <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    {t.uiAdminPasswordLabel} *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                    />
                    <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    {t.uiConfirmPasswordLabel} *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                    />
                    <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] font-medium text-sm transition-all cursor-pointer min-h-[46px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.uiGoBack}</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-semibold text-sm shadow-md shadow-[var(--brand-primary)]/20 transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer min-h-[46px]"
                >
                  {submitting ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>{t.uiInstallingSystem}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.uiCompleteInstallation}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Launchpad & Email Verification */}
          {step === 4 && setupResult && (
            <div className="space-y-8 text-center sm:text-left">
              {/* Success Banner */}
              <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {t.uiSetupSuccessTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-600/90 dark:text-emerald-400/90 mt-1 leading-relaxed">
                    {t.uiSetupSuccessDesc}
                  </p>
                </div>
              </div>

              {/* Email Verification Box */}
              <div className="p-6 rounded-3xl border border-[var(--border-default)] bg-[var(--bg-subtle)]/50 space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      {t.uiStep4Verification}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                      {t.uiVerificationRequiredNotice}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={setupResult.verifyUrl}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{t.uiInstantVerifyButton}</span>
                  </a>

                  <button
                    type="button"
                    onClick={copyVerifyLink}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-secondary)] transition-all cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {t.uiDiagnosticsCopied}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.uiCopyVerificationLink}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Next Steps Quick Launchpad */}
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                  {t.uiNextStepsLaunchpad}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link
                    href="/dashboard/admin"
                    className="p-5 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--brand-border)] bg-[var(--bg-surface)] hover:bg-[var(--brand-surface)] transition-all flex flex-col justify-between group shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-primary)] group-hover:scale-105 transition-transform mb-3">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                        {t.uiCreateFirstClinic}
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                        {t.uiCreateFirstClinicDesc}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/admin"
                    className="p-5 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--brand-border)] bg-[var(--bg-surface)] hover:bg-[var(--brand-surface)] transition-all flex flex-col justify-between group shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-primary)] group-hover:scale-105 transition-transform mb-3">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                        {t.uiAddDoctorsTitle}
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                        {t.uiAddDoctorsDesc}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/admin"
                    className="p-5 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--brand-border)] bg-[var(--bg-surface)] hover:bg-[var(--brand-surface)] transition-all flex flex-col justify-between group shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-primary)] group-hover:scale-105 transition-transform mb-3">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                        {t.uiConfigureRxTitle}
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                        {t.uiConfigureRxDesc}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Enter Dashboard Action */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98] min-h-[46px]"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t.uiEnterDashboard}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
