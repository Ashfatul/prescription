"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  Clock, 
  PhoneCall, 
  Mail, 
  MapPin, 
  AlertCircle, 
  Save, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { 
  HospitalSettings, 
  DEFAULT_HOSPITAL_SETTINGS 
} from "@/features/settings/settings.service";
import { ChangePasswordCard } from "@/components/common/change-password-card";
import { TwoFactorAuthCard } from "@/components/common/two-factor-auth-card";
import { useLanguage } from "@/lib/i18n/language-context";

export function SettingsManager() {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState<HospitalSettings>(DEFAULT_HOSPITAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setSettings(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchSettings();
  }, []);

  const handleChange = (key: keyof HospitalSettings, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
    setSaveSuccess(false);
    setErrorMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to save settings");
      }

      setSettings(json.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Network error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[var(--brand-primary)] mx-auto" />
        <p className="text-xs text-slate-500 font-medium">
          {language === "bn" ? "হাসপাতাল সেটিংস লোড হচ্ছে..." : "Loading hospital settings..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-primary)] text-xs font-bold">
            {language === "bn" ? "হাসপাতাল ওএস কনফিগারেশন" : "Hospital OS Configuration"}
          </span>
          <span className="text-xs text-[var(--text-muted)] font-medium">
            {language === "bn" ? "• পাবলিক পোর্টাল ও চেম্বার সেটিংস" : "• Public Portal & Chamber Variables"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          {t.hospitalSettingsTitle}
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {t.hospitalSettingsSubtitle}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Success / Error Alerts */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {language === "bn"
                ? "হাসপাতালের সেটিংস সফলভাবে সংরক্ষিত হয়েছে। সমস্ত পাবলিক পেজ, হেডার ও ফুটারে তথ্য আপডেট হয়েছে।"
                : "Hospital settings saved successfully. All public pages, headers, footers, and doctor directories will reflect these values immediately."}
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section 0: Authentication & Security */}
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
            <ShieldCheck className="w-5 h-5 text-[var(--brand-primary)]" />
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {t.authSecurityGovernance}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {t.authSecurityDesc}
              </p>
            </div>
          </div>

          {/* Toggle 1: Email Verification */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t.requireEmailVerificationLabel}</span>
                {settings.requireEmailVerification ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {t.mandatoryBadge}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-500">
                    {t.disabledBadge}
                  </span>
                )}
              </span>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                {language === "bn"
                  ? "সক্রিয় থাকলে, প্রতিটি নিবন্ধিত চিকিৎসক, স্টাফ, ক্লিনিক অ্যাডমিন এবং রোগীকে ড্যাশবোর্ডে প্রবেশের পূর্বে তাদের ইমেইল ঠিকানা নিশ্চিত করতে হবে।"
                  : "When enabled, every registered physician, staff member, clinic admin, and patient must confirm their email address before they can continue to dashboard or log in. Unverified users will be gated at the verification screen."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSettings((prev) => ({
                  ...prev,
                  requireEmailVerification: !prev.requireEmailVerification,
                }));
                setSaveSuccess(false);
              }}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.requireEmailVerification
                  ? "bg-[var(--brand-primary)]"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settings.requireEmailVerification ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Super Admin Clinic Approval */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t.requireOrgApprovalLabel}</span>
                {settings.requireOrgApproval ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {t.approvalRequiredBadge}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-500">
                    {t.autoApprovedBadge}
                  </span>
                )}
              </span>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                {language === "bn"
                  ? "সক্রিয় থাকলে, প্ল্যাটফর্ম সুপার অ্যাডমিনের অনুমোদন না পাওয়া পর্যন্ত নতুন কোনো ক্লিনিক সংস্থা লগইন বা রোগী পরিচালনা করতে পারবে না।"
                  : "When enabled, new clinic organizations cannot log in or manage patients until their account has been officially reviewed and confirmed by the platform Super Administrator."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSettings((prev) => ({
                  ...prev,
                  requireOrgApproval: !prev.requireOrgApproval,
                }));
                setSaveSuccess(false);
              }}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.requireOrgApproval
                  ? "bg-[var(--brand-primary)]"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settings.requireOrgApproval ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Patient Manual Verification */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t.requirePatientVerificationLabel}</span>
                {settings.requirePatientVerification ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {t.verificationRequiredBadge}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-500">
                    {t.autoVerifiedBadge}
                  </span>
                )}
              </span>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                {language === "bn"
                  ? "সক্রিয় থাকলে, রোগী নিজে নিবন্ধন করার পর ক্লিনিক্যাল ফ্রন্ট ডেস্ক স্টাফ বা হাসপাতাল অ্যাডমিন তাদের পরিচয় যাচাই না করা পর্যন্ত অ্যাকাউন্ট পেন্ডিং থাকবে।"
                  : "When enabled, newly self-registered patient accounts remain pending until clinical front desk staff or hospital administrators verify their identity. After verification, patients receive a confirmation email and gain login access."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSettings((prev) => ({
                  ...prev,
                  requirePatientVerification: !prev.requirePatientVerification,
                }));
                setSaveSuccess(false);
              }}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.requirePatientVerification
                  ? "bg-[var(--brand-primary)]"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settings.requirePatientVerification ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section 1: Hospital Identity */}
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
            <Building2 className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              {t.hospitalIdentityTitle}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.hospitalLegalName}
              </label>
              <input
                type="text"
                value={settings.hospitalName}
                onChange={(e) => handleChange("hospitalName", e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                placeholder="e.g. Metropolitan Specialized Hospital"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.branchAffiliation}
              </label>
              <input
                type="text"
                value={settings.hospitalBranch}
                onChange={(e) => handleChange("hospitalBranch", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                placeholder="e.g. Diagnostic & Consultation Block C"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.fullPhysicalAddress}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={settings.hospitalAddress}
                  onChange={(e) => handleChange("hospitalAddress", e.target.value)}
                  className="w-full input-icon-left !pl-11 pr-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  placeholder="e.g. Diagnostic Block C, 3rd Floor, Metropolitan Hospital, Dhaka"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Visiting Hours & Schedules */}
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
            <Clock className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              {t.opdVisitingHoursTitle}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === "bn" ? "বহির্বিভাগ (OPD) সময়সূচী" : "OPD Visiting Hours"}
              </label>
              <input
                type="text"
                value={settings.opdVisitingHours}
                onChange={(e) => handleChange("opdVisitingHours", e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                placeholder="e.g. 08:00 AM - 10:00 PM (Daily)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.weeklyChamberDays}
              </label>
              <input
                type="text"
                value={settings.chamberDays}
                onChange={(e) => handleChange("chamberDays", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                placeholder="e.g. Saturday - Thursday"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.chamberActivePill}
              </label>
              <input
                type="text"
                value={settings.emergencyStatus}
                onChange={(e) => handleChange("emergencyStatus", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                placeholder="e.g. OPD & Chamber 24/7 Active"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Emergency Hotlines & Contacts */}
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
            <PhoneCall className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              {t.emergencyHotlinesTitle}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.emergencyHotlineNumber}
              </label>
              <div className="relative">
                <PhoneCall className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none" />
                <input
                  type="text"
                  value={settings.emergencyHotline}
                  onChange={(e) => handleChange("emergencyHotline", e.target.value)}
                  required
                  className="w-full input-icon-left !pl-11 pr-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  placeholder="e.g. 10678"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.chamberContactPhone}
              </label>
              <div className="relative">
                <PhoneCall className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                  className="w-full input-icon-left !pl-11 pr-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  placeholder="e.g. +880 1711-234567"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.clinicalSupportEmail}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleChange("supportEmail", e.target.value)}
                  className="w-full input-icon-left !pl-11 pr-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  placeholder="e.g. support@hospital.org"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Emergency Medical Notice Banner Text */}
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              {t.emergencyNoticeTitle}
            </h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t.emergencyNoticeLabel}
            </label>
            <textarea
              rows={3}
              value={settings.emergencyNotice}
              onChange={(e) => handleChange("emergencyNotice", e.target.value)}
              className="w-full p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              placeholder="e.g. PPMS is a clinical management and prescription issuing tool..."
            />
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="p-5 rounded-3xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>{t.liveHeaderFooterPreview}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <strong className="block text-slate-900 dark:text-white">{settings.hospitalName}</strong>
              <span className="text-[11px] text-slate-500">{settings.hospitalAddress}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="font-semibold text-slate-600 dark:text-slate-300">OPD: {settings.opdVisitingHours}</span>
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                Hotline: {settings.emergencyHotline}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:opacity-95 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.savingHospitalSettings}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t.saveHospitalSettingsBtn}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Account Security, Two-Factor Authentication & Password Management */}
      <div className="pt-4 border-t border-[var(--border-subtle)] space-y-6">
        <TwoFactorAuthCard />
        <ChangePasswordCard />
      </div>
    </div>
  );
}
