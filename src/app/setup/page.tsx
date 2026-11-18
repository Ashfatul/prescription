"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Database,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
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
  Trash2,
  Send,
  Sparkles,
  Activity,
  KeyRound,
  Globe2,
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
  smtpConfigured?: boolean;
}

export default function SetupPage() {
  const { t } = useLanguage();

  // Status & Step
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyInstalled, setAlreadyInstalled] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | undefined>(undefined);
  const [dbError, setDbError] = useState<string | null>(null);

  // Database Wipe State
  const [existingUserCount, setExistingUserCount] = useState(0);
  const [wipeExistingDatabase, setWipeExistingDatabase] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [wipeSuccessMsg, setWipeSuccessMsg] = useState<string | null>(null);

  // Form Fields - Step 2: Platform Identity
  const [systemName, setSystemName] = useState("");
  const [systemTagline, setSystemTagline] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [emergencyHotline, setEmergencyHotline] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [timezone, setTimezone] = useState("Asia/Dhaka");

  // Form Fields - Step 3: Outgoing Mail & SMTP
  const [smtpEnabled, setSmtpEnabled] = useState(false);
  const [smtpPreset, setSmtpPreset] = useState("gmail");
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpEncryption, setSmtpEncryption] = useState("tls");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [smtpFromAddress, setSmtpFromAddress] = useState("");
  const [smtpFromName, setSmtpFromName] = useState("");
  const [smtpTestRecipient, setSmtpTestRecipient] = useState("");
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form Fields - Step 4: Root Super Admin
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Completed Setup Result - Step 5
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showManualActivation, setShowManualActivation] = useState(false);

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
          const userCount = data.data.existingUserCount || 0;
          setExistingUserCount(userCount);
          if (userCount > 0) {
            setWipeExistingDatabase(true);
          }
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
            const userCount = data.data.existingUserCount || 0;
            setExistingUserCount(userCount);
            if (userCount > 0) {
              setWipeExistingDatabase(true);
            }
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

  const handleWipeDatabaseNow = async () => {
    if (wiping) return;
    setWiping(true);
    setDbError(null);
    setWipeSuccessMsg(null);
    try {
      const res = await fetch("/api/setup/wipe", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setDbError(json.error || json.message || "Failed to wipe database.");
        return;
      }
      setExistingUserCount(0);
      setWipeExistingDatabase(false);
      setWipeSuccessMsg(t.uiWipeDatabaseSuccess);
      setTimeout(() => setWipeSuccessMsg(null), 4000);
    } catch (err: unknown) {
      setDbError(err instanceof Error ? err.message : "Error wiping database.");
    } finally {
      setWiping(false);
    }
  };

  const handlePresetChange = (preset: string) => {
    setSmtpPreset(preset);
    setSmtpTestResult(null);
    switch (preset) {
      case "gmail":
        setSmtpHost("smtp.gmail.com");
        setSmtpPort("587");
        setSmtpEncryption("tls");
        break;
      case "sendgrid":
        setSmtpHost("smtp.sendgrid.net");
        setSmtpPort("587");
        setSmtpEncryption("tls");
        setSmtpUser("apikey");
        break;
      case "mailgun":
        setSmtpHost("smtp.mailgun.org");
        setSmtpPort("587");
        setSmtpEncryption("tls");
        break;
      case "resend":
        setSmtpHost("smtp.resend.com");
        setSmtpPort("587");
        setSmtpEncryption("tls");
        setSmtpUser("resend");
        break;
      case "ses":
        setSmtpHost("email-smtp.us-east-1.amazonaws.com");
        setSmtpPort("587");
        setSmtpEncryption("tls");
        break;
      case "local":
        setSmtpHost("127.0.0.1");
        setSmtpPort("1025");
        setSmtpEncryption("none");
        break;
      default:
        break;
    }
  };

  const handleTestSmtp = async () => {
    if (!smtpHost.trim()) {
      setSmtpTestResult({ success: false, message: "SMTP host is required." });
      return;
    }
    const targetRecipient = smtpTestRecipient.trim() || adminEmail.trim() || supportEmail.trim();
    if (!targetRecipient || !targetRecipient.includes("@")) {
      setSmtpTestResult({ success: false, message: "Please specify a valid test recipient email address." });
      return;
    }

    setTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await fetch("/api/setup/test-smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: smtpHost,
          port: smtpPort,
          encryption: smtpEncryption,
          user: smtpUser,
          pass: smtpPass,
          fromAddress: smtpFromAddress.trim() || supportEmail.trim() || adminEmail.trim() || "noreply@hospital.local",
          fromName: smtpFromName.trim() || systemName.trim() || "Hospital Prescriptions",
          testRecipient: targetRecipient,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setSmtpTestResult({
          success: false,
          message: json.error || json.message || "Failed to connect to SMTP server.",
        });
      } else {
        setSmtpEnabled(true);
        setSmtpTestResult({
          success: true,
          message: json.message || t.uiSmtpTestSuccess,
        });
      }
    } catch (err: unknown) {
      setSmtpTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Network error contacting SMTP testing service.",
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemName.trim()) {
      setFormError("System or Hospital name is required.");
      return;
    }
    setFormError(null);
    setStep(3);
  };

  const handleBootstrapSubmit = async (e?: React.FormEvent, forceWipe?: boolean) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
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

    const willWipe = forceWipe !== undefined ? forceWipe : wipeExistingDatabase;

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
          wipeExistingDatabase: willWipe,
          smtpEnabled: smtpEnabled,
          smtpHost: smtpEnabled ? smtpHost.trim() : undefined,
          smtpPort: smtpEnabled ? parseInt(smtpPort, 10) : undefined,
          smtpEncryption: smtpEnabled ? smtpEncryption : undefined,
          smtpUser: smtpEnabled ? smtpUser.trim() : undefined,
          smtpPass: smtpEnabled ? smtpPass.trim() : undefined,
          smtpFromAddress: smtpEnabled ? (smtpFromAddress.trim() || supportEmail.trim() || adminEmail.trim()) : undefined,
          smtpFromName: smtpEnabled ? (smtpFromName.trim() || systemName.trim()) : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormError(json.error || json.message || "Setup failed to complete.");
        setSubmitting(false);
        return;
      }

      setSetupResult(json.data);
      setStep(5);
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
        <div className="w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 sm:p-10 shadow-sm text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 shadow-2xs">
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
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-semibold text-sm shadow-sm transition-all active:scale-[0.98] min-h-[46px]"
          >
            <span>{t.uiGoToLogin}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  const stepsList = [
    { num: 1, label: t.uiStep1Database, short: t.uiStep1Short },
    { num: 2, label: t.uiStep2SystemIdentity, short: t.uiStep2Short },
    { num: 3, label: t.uiStep3MailSmtp, short: t.uiStep3Short },
    { num: 4, label: t.uiStep4SuperAdmin, short: t.uiStep4Short },
    { num: 5, label: t.uiStep5Launchpad, short: t.uiStep5Short },
  ];

  const overallProgressPct = step * 20;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col transition-colors selection:bg-[var(--brand-primary)] selection:text-white">
      {/* Top Header Bar: Expansive Wide Canvas Layout up to 1920px */}
      <header className="w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--brand-primary)] to-teal-700 flex items-center justify-center text-white shadow-xs shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold tracking-tight text-[var(--text-primary)] truncate">
                  {systemName.trim() || t.appTitle}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--brand-surface)] text-[var(--brand-primary)] border border-[var(--brand-primary)]/20">
                  <Activity className="w-3 h-3 animate-pulse" />
                  <span>Onboarding OS</span>
                </span>
              </div>
              <span className="text-[11px] font-medium text-[var(--text-muted)] truncate block -mt-0.5">
                {systemTagline.trim() || t("uiSystemSetupOnboarding")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {dbConnected && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>PostgreSQL</span>
                {latencyMs !== undefined && (
                  <span className="text-[10px] text-emerald-600/80 font-mono">
                    ({latencyMs}ms)
                  </span>
                )}
              </div>
            )}
            <div className="px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-secondary)]">
              Step {step} / 5
            </div>
            <LanguageToggle />
            <ThemeCustomizer compact direction="down" align="right" />
          </div>
        </div>
      </header>

      {/* Main Wide Canvas Workspace Container */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Context, Stepper & Live Telemetry Rail (4 Cols) */}
          <aside className="lg:col-span-4 xl:col-span-4 space-y-5 lg:sticky lg:top-24">
            
            {/* Stepper Card */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-5">
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-[var(--text-secondary)] uppercase tracking-wider">
                    {t.uiOverallSetupProgress}
                  </span>
                  <span className="text-[var(--brand-primary)] font-mono">
                    {overallProgressPct}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-500"
                    style={{ width: `${overallProgressPct}%` }}
                  />
                </div>
              </div>

              {/* Vertical Step Timeline */}
              <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                {stepsList.map((s) => {
                  const isDone = step > s.num;
                  const isCurrent = step === s.num;
                  return (
                    <div
                      key={s.num}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                        isCurrent
                          ? "border-[var(--brand-primary)]/40 bg-[var(--brand-surface)]/25 shadow-2xs"
                          : isDone
                          ? "border-transparent hover:bg-[var(--bg-subtle)]/40"
                          : "border-transparent opacity-60"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-all ${
                          isDone
                            ? "bg-emerald-500 text-white"
                            : isCurrent
                            ? "bg-[var(--brand-primary)] text-white shadow-xs scale-105"
                            : "bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : s.num}
                      </div>
                      <div className="min-w-0">
                        <span
                          className={`text-xs font-bold block truncate ${
                            isCurrent
                              ? "text-[var(--text-primary)]"
                              : isDone
                              ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                              : "text-[var(--text-secondary)]"
                          }`}
                        >
                          {s.label}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)] block truncate mt-0.5">
                          {s.short}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Letterhead Preview Card */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                  <Sparkles className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>{t.uiLivePrescriptionLetterhead}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--brand-surface)] text-[var(--brand-primary)]">
                  Live Sync
                </span>
              </div>

              {/* Simulated Prescription Header */}
              <div className="p-4 rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-extrabold text-[var(--text-primary)] truncate">
                      {systemName.trim() || "National Health Medical Center"}
                    </h4>
                    <p className="text-[11px] text-[var(--brand-primary)] font-semibold truncate">
                      {systemTagline.trim() || "Specialized OPD Consultation & Digital Prescribing"}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)]/60 text-[10px] text-[var(--text-muted)] space-y-0.5">
                  <div className="truncate">
                    <strong>Support:</strong> {supportEmail.trim() || "support@hospital.org"}
                  </div>
                  <div className="truncate">
                    <strong>Phone / Hot:</strong> {contactPhone.trim() || "+880 1700-000000"}{" "}
                    {emergencyHotline ? `• Emg: ${emergencyHotline.trim()}` : ""}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                {t.uiRealtimeSyncNotice}
              </p>
            </div>

            {/* System Telemetry & Architecture Badges */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>{t.uiPostgresConnected}</span>
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {dbConnected ? "Active" : "Pending"}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>{t.uiBcryptHashing}</span>
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  Verified
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>{t.uiDualLocaleReady}</span>
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  EN / BN
                </span>
              </div>
            </div>
          </aside>

          {/* Right Column: Interactive Setup Step Workspace (8 Cols) */}
          <section className="lg:col-span-8 xl:col-span-8">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 lg:p-10 shadow-xs space-y-8">
              
              {/* Form Title & Subtitle */}
              <div className="pb-6 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--brand-surface)] text-[var(--brand-primary)]">
                    Step {step} of 5
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                  {step === 1 && t.uiStep1Database}
                  {step === 2 && t.uiStep2SystemIdentity}
                  {step === 3 && t.uiStep3MailSmtp}
                  {step === 4 && t.uiStep4SuperAdmin}
                  {step === 5 && t.uiStep5Launchpad}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                  {step === 1 && t.uiDatabaseConnectedDesc}
                  {step === 2 && t.uiSetupWizardSubtitle}
                  {step === 3 && t.uiSmtpSubtitle}
                  {step === 4 && t.uiStep4Short}
                  {step === 5 && t.uiSetupSuccessDesc}
                </p>
              </div>

              {/* Step 1: Database Health & Conflict Wipe */}
              {step === 1 && (
                <div className="space-y-6">
                  {loading ? (
                    <div className="p-12 text-center rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-3">
                      <RotateCw className="w-6 h-6 animate-spin text-[var(--brand-primary)] mx-auto" />
                      <p className="text-xs font-semibold text-[var(--text-secondary)]">
                        {t.uiCheckingDatabase}
                      </p>
                    </div>
                  ) : dbConnected ? (
                    <div className="space-y-6">
                      <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                            {t.uiDatabaseConnected}
                          </h3>
                          <p className="text-xs text-emerald-700/90 dark:text-emerald-400/90 leading-relaxed">
                            {t.uiDatabaseConnectedDesc}
                          </p>
                          {latencyMs !== undefined && (
                            <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                              Telemetry: ping latency {latencyMs}ms • PostgreSQL driver verified
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Existing Records / Wipe Check */}
                      {existingUserCount > 0 && (
                        <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-3">
                          <div className="flex items-start gap-3.5">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                                {t.uiExistingDataDetected} ({existingUserCount} existing accounts)
                              </h4>
                              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                                {t.uiExistingDataDetectedDesc}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              disabled={wiping}
                              onClick={handleWipeDatabaseNow}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                            >
                              {wiping ? (
                                <>
                                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>{t.uiWipingDatabase}</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>{t.uiWipeDatabaseNow}</span>
                                </>
                              )}
                            </button>
                            <span className="text-[11px] text-[var(--text-muted)]">
                              Clean resets users & clinics so your new admin email does not collide.
                            </span>
                          </div>
                        </div>
                      )}

                      {wipeSuccessMsg && (
                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{wipeSuccessMsg}</span>
                        </div>
                      )}

                      <div className="flex justify-end pt-4 border-t border-[var(--border-subtle)]">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer min-h-[46px]"
                        >
                          <span>{t.uiContinueToNext}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-red-800 dark:text-red-300">
                            {t.uiDatabaseNotConnected}
                          </h3>
                          <p className="text-xs text-red-700/90 dark:text-red-400/90 leading-relaxed">
                            {dbError || t.uiDatabaseErrorDesc}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={fetchStatus}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)] transition-all cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>{t.uiRetryConnection}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: System Identity & Letterhead */}
              {step === 2 && (
                <form onSubmit={handleStep2Submit} className="space-y-6">
                  {formError && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                        className="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
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
                        className="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        {t.uiSupportEmailLabel}
                      </label>
                      <input
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        placeholder={t.uiSupportEmailPlaceholder}
                        className="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        {t.uiContactPhoneLabel}
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="e.g., +880 1700-000000"
                        className="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        {t.uiEmergencyHotlineLabel}
                      </label>
                      <input
                        type="tel"
                        value={emergencyHotline}
                        onChange={(e) => setEmergencyHotline(e.target.value)}
                        placeholder="e.g., 999 or 10678"
                        className="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
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

                    <div className="space-y-1.5">
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
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] font-semibold text-xs transition-all cursor-pointer min-h-[42px]"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{t.uiGoBack}</span>
                    </button>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer min-h-[42px]"
                    >
                      <span>{t.uiContinueToNext}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Outgoing Mail & SMTP Server */}
              {step === 3 && (
                <div className="space-y-6">
                  {/* Preset Provider Selector Cards */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      {t.uiSmtpPresetLabel}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: "gmail", name: "Google Gmail", host: "smtp.gmail.com" },
                        { id: "sendgrid", name: "SendGrid", host: "smtp.sendgrid.net" },
                        { id: "mailgun", name: "Mailgun", host: "smtp.mailgun.org" },
                        { id: "resend", name: "Resend", host: "smtp.resend.com" },
                        { id: "ses", name: "Amazon SES", host: "email-smtp.us-east-1" },
                        { id: "local", name: "Local Mailpit", host: "127.0.0.1:1025" },
                      ].map((preset) => {
                        const isSelected = smtpPreset === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handlePresetChange(preset.id)}
                            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                              isSelected
                                ? "border-[var(--brand-primary)] bg-[var(--brand-surface)] text-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20 font-bold"
                                : "border-[var(--border-subtle)] bg-[var(--bg-app)] hover:border-[var(--border-strong)] text-[var(--text-secondary)]"
                            }`}
                          >
                            <span className="text-xs block truncate">{preset.name}</span>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono block truncate mt-0.5">
                              {preset.host}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        {t.uiSmtpHostLabel} *
                      </label>
                      <input
                        type="text"
                        value={smtpHost}
                        onChange={(e) => {
                          setSmtpHost(e.target.value);
                          setSmtpTestResult(null);
                        }}
                        placeholder="e.g., smtp.gmail.com"
                        className="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        {t.uiSmtpPortLabel} *
                      </label>
                      <input
                        type="number"
                        value={smtpPort}
                        onChange={(e) => {
                          setSmtpPort(e.target.value);
                          setSmtpTestResult(null);
                        }}
                        placeholder="587"
                        className="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <CustomSelect
                        label={t.uiSmtpEncryptionLabel}
                        value={smtpEncryption}
                        onChange={(val) => {
                          setSmtpEncryption(val);
                          setSmtpTestResult(null);
                        }}
                        options={[
                          { value: "tls", label: "TLS (Port 587)" },
                          { value: "ssl", label: "SSL (Port 465)" },
                          { value: "none", label: "None (25/1025)" },
                        ]}
                        allowClear={false}
                        searchable={false}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        {t.uiSmtpUserLabel}
                      </label>
                      <input
                        type="text"
                        value={smtpUser}
                        onChange={(e) => {
                          setSmtpUser(e.target.value);
                          setSmtpTestResult(null);
                        }}
                        placeholder="e.g., your-email@gmail.com"
                        className="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        {t.uiSmtpPassLabel}
                      </label>
                      <div className="relative">
                        <input
                          type={showSmtpPass ? "text" : "password"}
                          value={smtpPass}
                          onChange={(e) => {
                            setSmtpPass(e.target.value);
                            setSmtpTestResult(null);
                          }}
                          placeholder="App password or API token"
                          className="w-full pl-4 pr-11 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSmtpPass(!showSmtpPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 cursor-pointer focus:outline-none"
                          tabIndex={-1}
                          aria-label={showSmtpPass ? t.uiHidePassword : t.uiShowPassword}
                        >
                          {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        {t.uiSmtpFromAddressLabel}
                      </label>
                      <input
                        type="email"
                        value={smtpFromAddress}
                        onChange={(e) => setSmtpFromAddress(e.target.value)}
                        placeholder={supportEmail || "noreply@hospital.local"}
                        className="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        {t.uiSmtpFromNameLabel}
                      </label>
                      <input
                        type="text"
                        value={smtpFromName}
                        onChange={(e) => setSmtpFromName(e.target.value)}
                        placeholder={systemName || "Hospital Prescriptions"}
                        className="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                      />
                    </div>
                  </div>

                  {/* Test Email Box */}
                  <div className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/70 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                          <span>{t.uiSmtpSendTestButton}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          Send a diagnostic verification email before proceeding.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          value={smtpTestRecipient}
                          onChange={(e) => setSmtpTestRecipient(e.target.value)}
                          placeholder={adminEmail || supportEmail || "test@domain.com"}
                          className="w-48 sm:w-56 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                        />
                        <button
                          type="button"
                          disabled={testingSmtp}
                          onClick={handleTestSmtp}
                          className="px-4 py-2 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {testingSmtp ? (
                            <>
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                              <span>{t.uiSmtpTesting}</span>
                            </>
                          ) : (
                            <span>{t.uiSmtpSendTestButton}</span>
                          )}
                        </button>
                      </div>
                    </div>

                    {smtpTestResult && (
                      <div
                        className={`p-3 rounded-lg text-xs font-medium ${
                          smtpTestResult.success
                            ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold"
                            : "bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {smtpTestResult.message}
                      </div>
                    )}
                  </div>

                  {/* Navigation Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--border-subtle)]">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] font-semibold text-xs transition-all cursor-pointer min-h-[42px]"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{t.uiGoBack}</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSmtpEnabled(false);
                          setStep(4);
                        }}
                        className="px-4 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-secondary)] transition-all cursor-pointer min-h-[42px]"
                      >
                        {t.uiSmtpSkipButton}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSmtpEnabled(true);
                          setStep(4);
                        }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer min-h-[42px]"
                      >
                        <span>{t.uiContinueToNext}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Root Super Administrator */}
              {step === 4 && (
                <form onSubmit={(e) => handleBootstrapSubmit(e)} className="space-y-6">
                  {formError && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span>{formError}</span>
                        {formError.includes("already exists") && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => handleBootstrapSubmit(undefined, true)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{t.uiWipeAndRetry}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
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
                          className="w-full pl-11 pr-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
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
                          type={showAdminPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="w-full pl-11 pr-11 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                        />
                        <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 cursor-pointer focus:outline-none"
                          tabIndex={-1}
                          aria-label={showAdminPassword ? t.uiHidePassword : t.uiShowPassword}
                        >
                          {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        {t.uiConfirmPasswordLabel} *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-11 pr-11 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all min-h-[46px]"
                        />
                        <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 cursor-pointer focus:outline-none"
                          tabIndex={-1}
                          aria-label={showConfirmPassword ? t.uiHidePassword : t.uiShowPassword}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Optional Wipe Database Checkbox */}
                    <div className="sm:col-span-2 pt-1">
                      <label className="flex items-start gap-3 p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/60 cursor-pointer hover:border-[var(--brand-primary)]/40 transition-colors">
                        <input
                          type="checkbox"
                          checked={wipeExistingDatabase}
                          onChange={(e) => setWipeExistingDatabase(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/20 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                            {t.uiWipeDatabaseOption}
                          </div>
                          <div className="text-[11px] sm:text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                            {t.uiWipeDatabaseOptionDesc}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] font-semibold text-xs transition-all cursor-pointer min-h-[42px]"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{t.uiGoBack}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer min-h-[42px] disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          <span>{t.uiInstallingSystem}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>{t.uiCompleteInstallation}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 5: System Launchpad & Account Activation */}
              {step === 5 && setupResult && (
                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-emerald-800 dark:text-emerald-300">
                        {t.uiSetupSuccessTitle}
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-700/90 dark:text-emerald-400/90 mt-1 leading-relaxed">
                        {t.uiSetupSuccessDesc}
                      </p>
                    </div>
                  </div>

                  {/* Mail Verification Mode */}
                  {setupResult.smtpConfigured && setupResult.emailSent ? (
                    <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                            {t.uiCheckInboxForVerify}
                          </h4>
                          <p className="text-xs text-emerald-700/90 dark:text-emerald-400/90 mt-1 leading-relaxed">
                            {t.uiCheckInboxForVerifyDesc} ({setupResult.user.email})
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setShowManualActivation(!showManualActivation)}
                          className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-medium underline cursor-pointer"
                        >
                          {showManualActivation ? "Hide Manual Activation" : t.uiManualActivationFallback}
                        </button>
                      </div>

                      {showManualActivation && (
                        <div className="pt-3 border-t border-emerald-500/20 flex flex-wrap items-center gap-3">
                          <a
                            href={setupResult.verifyUrl}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{t.uiInstantVerifyButton}</span>
                          </a>

                          <button
                            type="button"
                            onClick={copyVerifyLink}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-emerald-600/30 bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-secondary)] transition-all cursor-pointer"
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
                      )}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                            {t.uiOfflineActivationTitle}
                          </h4>
                          <p className="text-xs text-amber-700/90 dark:text-amber-400/90 mt-1 leading-relaxed">
                            {t.uiOfflineActivationDesc}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <a
                          href={setupResult.verifyUrl}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white text-xs font-bold shadow-xs transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{t.uiInstantVerifyButton}</span>
                        </a>

                        <button
                          type="button"
                          onClick={copyVerifyLink}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-secondary)] transition-all cursor-pointer"
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
                  )}

                  {/* Launchpad Quick Start Cards */}
                  <div className="space-y-4">
                    <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                      {t.uiNextStepsLaunchpad}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Link
                        href="/dashboard/admin"
                        className="p-5 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--brand-border)] bg-[var(--bg-surface)] hover:bg-[var(--brand-surface)] transition-all flex flex-col justify-between group shadow-2xs"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-primary)] group-hover:scale-105 transition-transform mb-3">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                            {t.uiCreateFirstClinic}
                          </h5>
                          <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                            {t.uiCreateFirstClinicDesc}
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/dashboard/admin"
                        className="p-5 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--brand-border)] bg-[var(--bg-surface)] hover:bg-[var(--brand-surface)] transition-all flex flex-col justify-between group shadow-2xs"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-primary)] group-hover:scale-105 transition-transform mb-3">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                            {t.uiAddDoctorsTitle}
                          </h5>
                          <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                            {t.uiAddDoctorsDesc}
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/dashboard/admin"
                        className="p-5 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--brand-border)] bg-[var(--bg-surface)] hover:bg-[var(--brand-surface)] transition-all flex flex-col justify-between group shadow-2xs"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-primary)] group-hover:scale-105 transition-transform mb-3">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                            {t.uiConfigureRxTitle}
                          </h5>
                          <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                            {t.uiConfigureRxDesc}
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Primary Enter Dashboard Button */}
                  <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end">
                    <Link
                      href="/dashboard/admin"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>{t.uiEnterDashboard}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}