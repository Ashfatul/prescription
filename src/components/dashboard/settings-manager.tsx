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
    ShieldCheck,
} from "lucide-react";
import {
    HospitalSettings,
    DEFAULT_HOSPITAL_SETTINGS,
} from "@/features/settings/settings.service";
import { ChangePasswordCard } from "@/components/common/change-password-card";
import { TwoFactorAuthCard } from "@/components/common/two-factor-auth-card";
import { useLanguage } from "@/lib/i18n/language-context";
import { useAuth } from "@/lib/auth/auth-context";

export function SettingsManager() {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [settings, setSettings] = useState<HospitalSettings>(
        DEFAULT_HOSPITAL_SETTINGS,
    );
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [customDomain, setCustomDomain] = useState("");
    const [domainStatus, setDomainStatus] = useState("NONE");
    const [domainDns, setDomainDns] = useState<{
        cnameName: string;
        cnameTarget: string;
        txtName: string;
        txtValue: string | null;
    } | null>(null);
    const [domainSaving, setDomainSaving] = useState(false);
    const [domainVerifying, setDomainVerifying] = useState(false);
    const canManageDomain =
        user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

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

    useEffect(() => {
        if (!canManageDomain) return;
        fetch("/api/organizations/domain")
            .then((res) => (res.ok ? res.json() : null))
            .then((json) => {
                if (json?.success && json.data) {
                    setCustomDomain(json.data.domain || "");
                    setDomainStatus(json.data.status || "NONE");
                    setDomainDns(json.data.dns || null);
                }
            })
            .catch(() => {});
    }, [canManageDomain]);

    const saveCustomDomain = async () => {
        setDomainSaving(true);
        setErrorMsg(null);
        try {
            const res = await fetch("/api/organizations/domain", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain: customDomain.trim() || null }),
            });
            const json = await res.json();
            if (!res.ok || !json.success)
                throw new Error(json.message || "Failed to save custom domain");
            setCustomDomain(json.data.domain || "");
            setDomainStatus(json.data.status || "NONE");
            setDomainDns(json.data.dns || null);
        } catch (error) {
            setErrorMsg(
                error instanceof Error
                    ? error.message
                    : "Failed to save custom domain",
            );
        } finally {
            setDomainSaving(false);
        }
    };

    const verifyCustomDomain = async () => {
        setDomainVerifying(true);
        setErrorMsg(null);
        try {
            const res = await fetch("/api/organizations/domain", {
                method: "POST",
            });
            const json = await res.json();
            if (!res.ok || !json.success)
                throw new Error(json.message || "Domain verification failed");
            setDomainStatus(json.data.status || "VERIFIED");
            setDomainDns(json.data.dns || null);
        } catch (error) {
            setErrorMsg(
                error instanceof Error
                    ? error.message
                    : "Domain verification failed",
            );
        } finally {
            setDomainVerifying(false);
        }
    };

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
            setErrorMsg(
                err instanceof Error ? err.message : "Network error occurred",
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[var(--brand-primary)] mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                    {t("uiLoadingHospitalSettings")}
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
                        {t(
                            "uiSaaSPlatformConfiguration",
                            "SaaS Platform Configuration",
                        )}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-medium">
                        {t(
                            "uiPlatformGovernance",
                            "Platform governance and support",
                        )}
                    </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                    {t(
                        "uiPlatformAdministrationSettings",
                        "Platform Administration Settings",
                    )}
                </h1>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {t(
                        "uiPlatformAdministrationSubtitle",
                        "Manage platform-wide security, identity, support, and clinic tenancy. Clinic schedules and chamber details are managed inside each clinic workspace.",
                    )}
                </p>
            </div>

            {canManageDomain && (
                <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-[var(--brand-primary)]" />
                        <div>
                            <h2 className="text-base font-bold text-[var(--text-primary)]">
                                Custom clinic domain
                            </h2>
                            <p className="text-xs text-[var(--text-muted)]">
                                Use your own domain for the clinic portal and
                                patient booking pages.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <label className="flex-1 space-y-1.5">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                Domain
                            </span>
                            <input
                                type="text"
                                value={customDomain}
                                onChange={(event) =>
                                    setCustomDomain(event.target.value)
                                }
                                placeholder="clinic.example.com"
                                className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100"
                            />
                        </label>
                        <button
                            type="button"
                            onClick={() => void saveCustomDomain()}
                            disabled={domainSaving}
                            className="rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60"
                        >
                            {domainSaving ? "Saving..." : "Save domain"}
                        </button>
                    </div>
                    {domainStatus !== "NONE" && (
                        <div className="space-y-3 rounded-2xl bg-[var(--bg-subtle)] p-4 text-xs text-slate-600 dark:text-slate-300">
                            <p className="font-bold">Status: {domainStatus}</p>
                            <p>
                                Add these DNS records, then contact platform
                                support to verify the domain.
                            </p>
                            {domainDns && (
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <code className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
                                        CNAME {domainDns.cnameName} →{" "}
                                        {domainDns.cnameTarget}
                                    </code>
                                    <code className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
                                        TXT {domainDns.txtName} →{" "}
                                        {domainDns.txtValue}
                                    </code>
                                </div>
                            )}
                            {domainStatus !== "VERIFIED" && (
                                <button
                                    type="button"
                                    onClick={() => void verifyCustomDomain()}
                                    disabled={domainVerifying}
                                    className="rounded-xl border border-[var(--brand-border)] px-4 py-2 text-xs font-bold text-[var(--brand-text)] disabled:opacity-60"
                                >
                                    {domainVerifying
                                        ? "Checking DNS..."
                                        : "Verify DNS records"}
                                </button>
                            )}
                        </div>
                    )}
                </section>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {/* Success / Error Alerts */}
                {saveSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>
                            {t("uiHospitalSettingsSavedSuccessfullyAll")}
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
                                {t("uiWhenEnabledEveryRegisteredPhysician")}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setSettings((prev) => ({
                                    ...prev,
                                    requireEmailVerification:
                                        !prev.requireEmailVerification,
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
                                    settings.requireEmailVerification
                                        ? "translate-x-5"
                                        : "translate-x-0"
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
                                {t("uiWhenEnabledNewClinicOrganizations")}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setSettings((prev) => ({
                                    ...prev,
                                    requireOrgApproval:
                                        !prev.requireOrgApproval,
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
                                    settings.requireOrgApproval
                                        ? "translate-x-5"
                                        : "translate-x-0"
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
                                {t("uiWhenEnabledNewlySelfRegistered")}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setSettings((prev) => ({
                                    ...prev,
                                    requirePatientVerification:
                                        !prev.requirePatientVerification,
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
                                    settings.requirePatientVerification
                                        ? "translate-x-5"
                                        : "translate-x-0"
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Section 1: Platform Identity */}
                <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
                        <Building2 className="w-5 h-5 text-[var(--brand-primary)]" />
                        <h2 className="text-base font-bold text-[var(--text-primary)]">
                            {t("uiPlatformIdentity", "Platform Identity")}
                        </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {t("uiPlatformName", "Platform name")}
                            </label>
                            <input
                                type="text"
                                value={settings.hospitalName}
                                onChange={(e) =>
                                    handleChange("hospitalName", e.target.value)
                                }
                                required
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                                placeholder="e.g. CareFlow"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {t(
                                    "uiPlatformOperations",
                                    "Platform operations",
                                )}
                            </label>
                            <input
                                type="text"
                                value={settings.hospitalBranch}
                                onChange={(e) =>
                                    handleChange(
                                        "hospitalBranch",
                                        e.target.value,
                                    )
                                }
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                                placeholder="e.g. SaaS Operations"
                            />
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {t(
                                    "uiPlatformAddress",
                                    "Platform address or support location",
                                )}
                            </label>
                            <div className="relative">
                                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={settings.hospitalAddress}
                                    onChange={(e) =>
                                        handleChange(
                                            "hospitalAddress",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full input-icon-left !pl-11 pr-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                                    placeholder="e.g. Platform operations and support"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Clinic schedules are configured inside each clinic workspace. */}
                <div className="hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
                        <Clock className="w-5 h-5 text-[var(--brand-primary)]" />
                        <h2 className="text-base font-bold text-[var(--text-primary)]">
                            {t.opdVisitingHoursTitle}
                        </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {t("uiOpdVisitingHours")}
                            </label>
                            <input
                                type="text"
                                value={settings.opdVisitingHours}
                                onChange={(e) =>
                                    handleChange(
                                        "opdVisitingHours",
                                        e.target.value,
                                    )
                                }
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
                                onChange={(e) =>
                                    handleChange("chamberDays", e.target.value)
                                }
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
                                onChange={(e) =>
                                    handleChange(
                                        "emergencyStatus",
                                        e.target.value,
                                    )
                                }
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                                placeholder="e.g. OPD & Chamber 24/7 Active"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Platform Support & Inquiries */}
                <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
                        <PhoneCall className="w-5 h-5 text-[var(--brand-primary)]" />
                        <h2 className="text-base font-bold text-[var(--text-primary)]">
                            {t(
                                "uiPlatformSupportInquiries",
                                "Platform Support & Inquiries",
                            )}
                        </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {t("uiSupportPhone", "Support phone")}
                            </label>
                            <div className="relative">
                                <PhoneCall className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none" />
                                <input
                                    type="text"
                                    value={settings.contactPhone}
                                    onChange={(e) =>
                                        handleChange(
                                            "contactPhone",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full input-icon-left !pl-11 pr-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                                    placeholder="Optional platform support number"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {t("uiSupportEmail", "Support email")}
                            </label>
                            <div className="relative">
                                <PhoneCall className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={settings.supportEmail}
                                    onChange={(e) =>
                                        handleChange(
                                            "supportEmail",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full input-icon-left !pl-11 pr-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                                    placeholder="support@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {t("uiSupportScope", "Support scope")}
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="email"
                                    value={settings.emergencyStatus}
                                    onChange={(e) =>
                                        handleChange(
                                            "emergencyStatus",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full input-icon-left !pl-11 pr-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                                    placeholder="Product issue, security report, suggestion, or feature request"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Platform Support Notice */}
                <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <h2 className="text-base font-bold text-[var(--text-primary)]">
                            {t(
                                "uiPlatformSupportNotice",
                                "Platform Support Notice",
                            )}
                        </h2>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {t("uiSupportNoticeText", "Support notice")}
                        </label>
                        <textarea
                            rows={3}
                            value={settings.emergencyNotice}
                            onChange={(e) =>
                                handleChange("emergencyNotice", e.target.value)
                            }
                            className="w-full p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                            placeholder="Explain how users can report product issues, security concerns, suggestions, or feature requests."
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
                            <strong className="block text-slate-900 dark:text-white">
                                {settings.hospitalName}
                            </strong>
                            <span className="text-[11px] text-slate-500">
                                {settings.hospitalAddress}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px]">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">
                                Support:{" "}
                                {settings.supportEmail || "Not configured"}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] font-bold">
                                Platform operations
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
