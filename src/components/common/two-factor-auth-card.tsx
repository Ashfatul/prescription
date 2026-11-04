"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Lock,
  RefreshCw,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface SetupData {
  secret: string;
  qrCodeDataUrl: string;
  otpauthUri: string;
  backupCodes: string[];
}

interface TwoFactorStatus {
  twoFactorEnabled: boolean;
  backupCodesRemaining: number;
}

export function TwoFactorAuthCard() {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // Setup modal state
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupSuccess, setSetupSuccess] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  // Disable modal state
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableError, setDisableError] = useState<string | null>(null);

  // Regenerate backup codes state
  const [regenModalOpen, setRegenModalOpen] = useState(false);
  const [regenPassword, setRegenPassword] = useState("");
  const [newBackupCodes, setNewBackupCodes] = useState<string[] | null>(null);
  const [regenError, setRegenError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  // Fetch current 2FA status
  const refreshStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/status");
      const json = await res.json();
      if (res.ok && json.success) {
        setStatus(json.data);
      }
    } catch (err) {
      console.warn("Failed to retrieve 2FA status:", err);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    fetch("/api/auth/2fa/status")
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.success) {
          setStatus(json.data);
        }
      })
      .catch((err) => {
        console.warn("Failed to retrieve 2FA status:", err);
      })
      .finally(() => {
        if (!ignore) {
          setStatusLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Start 2FA Setup flow
  const handleStartSetup = async () => {
    setSetupLoading(true);
    setSetupError(null);
    setVerifyCode("");
    setSetupSuccess(false);

    try {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSetupData(json.data);
        setSetupModalOpen(true);
      } else {
        setSetupError(json.message || "Failed to initialize 2FA setup.");
      }
    } catch {
      setSetupError("Network error while initializing 2FA setup.");
    } finally {
      setSetupLoading(false);
    }
  };

  // Submit verification code to activate 2FA
  const handleVerifySetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim() || !setupData || isPending) return;

    setSetupError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/2fa/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: verifyCode.trim(),
            secret: setupData.secret,
            backupCodes: setupData.backupCodes,
          }),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          setSetupSuccess(true);
          await refreshStatus();
          setTimeout(() => {
            setSetupModalOpen(false);
            setSetupSuccess(false);
            setSetupData(null);
          }, 2500);
        } else {
          setSetupError(json.message || "Invalid verification code.");
        }
      } catch {
        setSetupError("Network error during verification.");
      }
    });
  };

  // Handle disabling 2FA
  const handleDisable2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword || isPending) return;

    setDisableError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/2fa/disable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: disablePassword }),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          setDisableModalOpen(false);
          setDisablePassword("");
          await refreshStatus();
        } else {
          setDisableError(json.message || "Failed to disable 2FA.");
        }
      } catch {
        setDisableError("Network error while disabling 2FA.");
      }
    });
  };

  // Handle regenerating backup codes
  const handleRegenBackupCodes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regenPassword || isPending) return;

    setRegenError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/2fa/backup-codes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: regenPassword }),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          setNewBackupCodes(json.backupCodes);
          setRegenPassword("");
          await refreshStatus();
        } else {
          setRegenError(json.message || "Failed to regenerate backup codes.");
        }
      } catch {
        setRegenError("Network error while regenerating backup codes.");
      }
    });
  };

  // Copy secret key to clipboard
  const handleCopySecret = () => {
    if (!setupData?.secret) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  // Copy all backup codes to clipboard
  const handleCopyBackupCodes = (codes: string[]) => {
    navigator.clipboard.writeText(codes.join("\n"));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  // Download backup codes as .txt file
  const handleDownloadBackupCodes = (codes: string[]) => {
    const text = `CareFlow OS - Two-Factor Authentication Backup Recovery Codes\nGenerated: ${new Date().toUTCString()}\n\nKeep these codes stored securely. Each code can be used once to access your account if you lose access to your authenticator app:\n\n${codes.join("\n")}\n`;
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `ppms-backup-codes-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
              status?.twoFactorEnabled
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            }`}
          >
            {status?.twoFactorEnabled ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
              <span>{t.twoFactorAuthentication}</span>
              {status?.twoFactorEnabled && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t.activeAndEnforced}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.twoFactorProtectDesc}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {statusLoading ? (
            <div className="h-9 w-24 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ) : status?.twoFactorEnabled ? (
            <button
              type="button"
              onClick={() => {
                setDisableError(null);
                setDisablePassword("");
                setDisableModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100/60 transition cursor-pointer"
            >
              {t.disable2fa}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartSetup}
              disabled={setupLoading}
              className="px-4 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center gap-2 cursor-pointer"
            >
              {setupLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.preparing}</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{t.enable2faProtection}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Body Status Card */}
      {status?.twoFactorEnabled ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t.authenticatorAppConfigured}</span>
              </div>
              <p className="text-emerald-700 dark:text-emerald-300 text-xs">
                {t.totpAppsDesc}
              </p>
            </div>
          </div>

          {/* Backup Codes Information Banner */}
          <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
                <KeyRound className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>{t.oneTimeRecoveryBackupCodes}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                {language === "bn"
                  ? <>আপনার জরুরি ব্যবহারের জন্য <strong className="text-[var(--text-primary)]">{status.backupCodesRemaining}</strong> {t.backupCodesRemainingDesc}</>
                  : <>You have <strong className="text-[var(--text-primary)]">{status.backupCodesRemaining}</strong> {t.backupCodesRemainingDesc}</>}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setRegenError(null);
                setRegenPassword("");
                setNewBackupCodes(null);
                setRegenModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--brand-border)] text-xs font-semibold text-[var(--text-primary)] transition cursor-pointer self-start sm:self-auto shrink-0"
            >
              {t.regenerateBackupCodes}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs space-y-2 text-slate-600 dark:text-slate-300">
          <p className="font-semibold text-[var(--text-primary)]">{t.whyEnable2fa}</p>
          <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400">
            <li>{t.reason2fa1}</li>
            <li>{t.reason2fa2}</li>
            <li>{t.reason2fa3}</li>
          </ul>
        </div>
      )}

      {/* SETUP MODAL */}
      {setupModalOpen && setupData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Title */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h4 className="text-base font-bold text-[var(--text-primary)]">
                  {t.configureAuthenticatorApp}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSetupModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-[var(--bg-subtle)] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {setupSuccess ? (
              <div className="py-8 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h5 className="text-lg font-bold text-[var(--text-primary)]">{t.twoFactorActive}</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {t.twoFactorConfirmationEmail}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Step 1: Scan QR Code */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
                    {t.step1ScanQrCode}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.openAuthenticatorAppDesc}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                    <div className="p-2 bg-white rounded-2xl border border-slate-200 shrink-0 shadow-xs">
                      <Image
                        src={setupData.qrCodeDataUrl}
                        alt="2FA QR Code"
                        width={140}
                        height={140}
                        className="rounded-xl"
                        unoptimized
                      />
                    </div>

                    <div className="space-y-2 text-xs min-w-0 flex-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                        {t.cantScanEnterKey}
                      </span>
                      <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] font-mono text-xs font-bold break-all text-[var(--text-primary)] select-all">
                        {setupData.secret}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-[var(--brand-border)] transition cursor-pointer"
                      >
                        {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSecret ? t.copiedKey : t.copyKey}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 2: Save Backup Recovery Codes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
                      {t.step2SaveBackupCodes}
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      {t.saveBeforeClosing}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.backupCodesEmergencyDesc}
                  </p>

                  <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {setupData.backupCodes.map((code) => (
                        <div
                          key={code}
                          className="px-2 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-center font-mono text-xs font-bold text-[var(--text-primary)]"
                        >
                          {code}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-[var(--border-subtle)]">
                      <button
                        type="button"
                        onClick={() => handleCopyBackupCodes(setupData.backupCodes)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-[var(--brand-border)] transition cursor-pointer"
                      >
                        {copiedBackup ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedBackup ? t.copiedAllCodes : t.copyAllCodes}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadBackupCodes(setupData.backupCodes)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-[var(--brand-border)] transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t.downloadTxt}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 3: Verify 6-digit Code */}
                <form onSubmit={handleVerifySetup} className="space-y-4 pt-2 border-t border-[var(--border-subtle)]">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1.5">
                      {t.step3Enter6DigitCode}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full text-center font-mono text-2xl font-bold tracking-[0.3em] px-4 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 outline-none transition"
                      autoFocus
                      required
                    />
                  </div>

                  {setupError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{setupError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSetupModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-[var(--border-default)] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-[var(--bg-subtle)] transition cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={isPending || verifyCode.trim().length !== 6}
                      className="px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition disabled:opacity-60 cursor-pointer flex items-center gap-2"
                    >
                      {isPending ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{t.verifying}</span>
                        </>
                      ) : (
                        <span>{t.verifyAndEnable2fa}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DISABLE 2FA CONFIRMATION MODAL */}
      {disableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
                <ShieldAlert className="w-5 h-5" />
                <h4 className="text-base font-bold text-[var(--text-primary)]">{t.disable2fa}</h4>
              </div>
              <button
                type="button"
                onClick={() => setDisableModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.disable2faWarning}
            </p>

            <form onSubmit={handleDisable2FA} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  {t.confirmCurrentPassword}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition"
                    autoFocus
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {disableError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{disableError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDisableModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-default)] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-[var(--bg-subtle)] transition cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending || !disablePassword}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-60 cursor-pointer flex items-center gap-2"
                >
                  {isPending ? t.disabling : t.confirmAndDisable2fa}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGENERATE BACKUP CODES MODAL */}
      {regenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-5 h-5 text-[var(--brand-primary)]" />
                <h4 className="text-base font-bold text-[var(--text-primary)]">
                  {newBackupCodes ? t.newBackupCodesTitle : t.regenerateBackupCodes}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setRegenModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {newBackupCodes ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.codesInvalidatedDesc}
                </p>

                <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {newBackupCodes.map((code) => (
                      <div
                        key={code}
                        className="px-2 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-center font-mono text-xs font-bold text-[var(--text-primary)]"
                      >
                        {code}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                    <button
                      type="button"
                      onClick={() => handleCopyBackupCodes(newBackupCodes)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-[var(--brand-border)] transition cursor-pointer"
                    >
                      {copiedBackup ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedBackup ? t.copied : t.copyKey}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadBackupCodes(newBackupCodes)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-[var(--brand-border)] transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.downloadTxt}</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setRegenModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition cursor-pointer"
                  >
                    {t.doneAndSaved}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegenBackupCodes} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("uiRegeneratingRecoveryCodesWillInvalidate")}
                </p>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    {t.password}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={regenPassword}
                      onChange={(e) => setRegenPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 outline-none transition"
                      autoFocus
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {regenError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{regenError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRegenModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[var(--border-default)] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-[var(--bg-subtle)] transition cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || !regenPassword}
                    className="px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs transition disabled:opacity-60 cursor-pointer flex items-center gap-2"
                  >
                    {isPending ? t.loading : t.regenerateBackupCodes}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
