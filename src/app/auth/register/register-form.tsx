"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Building2,
  Sparkles,
  MapPin,
  Globe,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { CustomSelect } from "@/components/common/custom-select";
import { CustomDatePicker } from "@/components/common/custom-date-picker";

type OrgOption = {
  id: string;
  name: string;
  slug: string;
};

type PricingPlanOption = {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  description: string | null;
  features: string[];
  isPopular?: boolean;
};

const baseInputClasses =
  "w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]";

const iconInputClasses = `${baseInputClasses} input-icon-left !pl-11 pr-4`;
const passwordInputClasses = `${baseInputClasses} input-icon-left !pl-11 pr-11`;

const textareaClasses =
  "w-full px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[84px] resize-none";

const labelClasses =
  "text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("type") === "patient" ? "patient" : "clinic";

  const { login } = useAuth();
  const [mode, setMode] = useState<"clinic" | "patient">(initialMode);

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");

  // Patient fields
  const [gender, setGender] = useState("Female");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [orgs, setOrgs] = useState<OrgOption[]>([]);

  // Clinic fields
  const [clinicName, setClinicName] = useState("");
  const [clinicSlug, setClinicSlug] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [plans, setPlans] = useState<PricingPlanOption[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");

  // Clinic Subdomain Validation State
  type SlugStatus = "idle" | "checking" | "available" | "unavailable";
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugMessage, setSlugMessage] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [currentHost] = useState(() => (typeof window !== "undefined" ? window.location.host : ""));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Auto slug generator from clinic name
  const handleClinicNameChange = (val: string) => {
    setClinicName(val);
    if (!isSlugManuallyEdited) {
      const slugified = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setClinicSlug(slugified);
    }
  };

  // Debounced real-time subdomain slug validation
  useEffect(() => {
    if (mode !== "clinic") return;

    const trimmed = clinicSlug.trim();
    const timeoutId = setTimeout(async () => {
      if (!trimmed) {
        setSlugStatus("idle");
        setSlugMessage("");
        return;
      }

      if (trimmed.length < 3) {
        setSlugStatus("unavailable");
        setSlugMessage("Subdomain must be at least 3 characters.");
        return;
      }

      setSlugStatus("checking");
      try {
        const res = await fetch(`/api/organizations/check-slug?slug=${encodeURIComponent(trimmed)}`);
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.available) {
            setSlugStatus("available");
            setSlugMessage("Subdomain is available!");
          } else {
            setSlugStatus("unavailable");
            setSlugMessage(json.data.reason || "Subdomain is already taken or unavailable.");
          }
        } else {
          setSlugStatus("unavailable");
          setSlugMessage(json.message || "Failed to validate subdomain.");
        }
      } catch {
        setSlugStatus("unavailable");
        setSlugMessage("Network error validating subdomain.");
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [clinicSlug, mode]);

  useEffect(() => {
    // Fetch organizations for patient dropdown
    fetch("/api/organizations")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setOrgs(res.data);
          if (res.data.length > 0) {
            setOrganizationId(res.data[0].id);
          }
        }
      })
      .catch(() => {});

    // Fetch SaaS pricing plans for clinic registration
    fetch("/api/pricing-plans")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setPlans(res.data);
          const urlPlan = searchParams.get("plan");
          if (urlPlan && res.data.some((p: PricingPlanOption) => p.id === urlPlan)) {
            setSelectedPlanId(urlPlan);
          } else {
            const popular = res.data.find((p: PricingPlanOption) => p.isPopular);
            if (popular) {
              setSelectedPlanId(popular.id);
            } else if (res.data.length > 0) {
              setSelectedPlanId(res.data[0].id);
            }
          }
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "clinic") {
        if (!clinicName.trim()) {
          throw new Error("Clinic or Hospital name is required.");
        }
        if (!clinicSlug.trim()) {
          throw new Error("Clinic identifier URL slug is required.");
        }
        if (slugStatus === "checking") {
          throw new Error("Validating clinic subdomain availability. Please wait...");
        }
        if (slugStatus === "unavailable") {
          throw new Error(slugMessage || "Please enter a valid, available subdomain for your clinic.");
        }
        if (!name.trim()) {
          throw new Error("Administrator full name is required.");
        }
        if (!email.trim() || !email.includes("@")) {
          throw new Error("Valid work email address is required.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isClinicRegistration: true,
            clinicName: clinicName.trim(),
            clinicSlug: clinicSlug.trim(),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            phone: phone.trim() || undefined,
            address: clinicAddress.trim() || undefined,
            planId: selectedPlanId || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || data.error || "Failed to register clinic.");
        }

        setSuccess(true);

        if (data.requireVerification) {
          router.push(`/auth/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
          return;
        }

        // Auto login administrator
        const loginRes = await login(email.trim().toLowerCase(), password);
        if (loginRes.success) {
          router.refresh();
          router.push("/dashboard/admin");
        } else {
          router.push("/auth/login?registered=true");
        }
      } else {
        // Patient registration
        if (!name.trim()) throw new Error("Full name is required.");
        if (!email.trim() || !email.includes("@")) throw new Error("Valid email address is required.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            phone: phone || undefined,
            gender,
            dateOfBirth: dateOfBirth || undefined,
            medicalHistory: medicalHistory || undefined,
            organizationId: organizationId || undefined,
            role: "PATIENT",
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || data.error || "Failed to create patient account.");
        }

        setSuccess(true);

        if (data.requireVerification) {
          router.push(`/auth/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
          return;
        }

        const loginRes = await login(email.trim().toLowerCase(), password);
        if (loginRes.success) {
          router.refresh();
          router.push("/dashboard/patient");
        } else {
          router.push("/auth/login?registered=true");
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-[var(--border-subtle)] shadow-inner">
        <button
          type="button"
          onClick={() => {
            setMode("clinic");
            setError("");
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            mode === "clinic"
              ? "bg-[var(--bg-surface)] text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>New Clinic (14-Day Free Trial)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("patient");
            setError("");
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            mode === "patient"
              ? "bg-[var(--bg-surface)] text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <HeartPulse className="w-4 h-4 text-rose-500" />
          <span>Patient Account</span>
        </button>
      </div>

      {/* Main Registration Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
        {mode === "clinic" ? (
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-500/20">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>14-Day Free Trial • No Credit Card Required</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Register Your Clinic or Hospital
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Create your independent clinical tenant. Add doctors, configure receptionist queue, prescribe digitally, and manage clinical formulary.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider border border-rose-500/20">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Patient Portal Registration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Create Your Health Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Access your prescriptions, medicine reminders, and doctor appointments.
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {mode === "clinic"
                ? "Clinic created with 14-day free trial! Redirecting to admin dashboard..."
                : "Account created successfully! Redirecting to patient dashboard..."}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "clinic" ? (
            /* Clinic Registration Fields */
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClasses}>
                    <Building2 className="w-3 h-3 text-[var(--brand-primary)]" />
                    <span>Clinic / Hospital Name *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={clinicName}
                      onChange={(e) => handleClinicNameChange(e.target.value)}
                      placeholder="e.g. CareWell Medical Center"
                      className={iconInputClasses}
                    />
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={labelClasses}>
                      <Globe className="w-3 h-3 text-[var(--brand-primary)]" />
                      <span>Clinic Subdomain Slug *</span>
                    </label>
                    {slugStatus === "checking" && (
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin text-[var(--brand-primary)]" />
                        <span>Validating...</span>
                      </span>
                    )}
                    {slugStatus === "available" && (
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Available</span>
                      </span>
                    )}
                    {slugStatus === "unavailable" && (
                      <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Unavailable</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={clinicSlug}
                      onChange={(e) => {
                        setIsSlugManuallyEdited(true);
                        setClinicSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                      }}
                      placeholder="carewell"
                      className={`${iconInputClasses} font-mono pr-10 ${
                        slugStatus === "available"
                          ? "!border-emerald-500 focus:!ring-emerald-500/20"
                          : slugStatus === "unavailable"
                          ? "!border-rose-500 focus:!ring-rose-500/20"
                          : ""
                      }`}
                    />
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    {slugStatus === "checking" && (
                      <Loader2 className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin pointer-events-none" />
                    )}
                    {slugStatus === "available" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    )}
                    {slugStatus === "unavailable" && (
                      <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    )}
                  </div>
                  {slugMessage && (
                    <p
                      className={`text-[11px] font-medium leading-tight ${
                        slugStatus === "available"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {slugMessage}
                    </p>
                  )}
                </div>
              </div>

              {/* SaaS Dedicated Subdomain Access Preview */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-[var(--brand-primary)]" />
                    Your Dedicated Clinic URL
                  </span>
                  {slugStatus === "available" && (
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Ready to Claim
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
                  <span className="text-slate-400 select-none">https://</span>
                  <span
                    className={`font-black ${
                      slugStatus === "available"
                        ? "text-[var(--brand-text)] underline decoration-[var(--brand-primary)] underline-offset-4"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {clinicSlug.trim() || "your-subdomain"}
                  </span>
                  <span className="text-slate-400 select-none">
                    .{currentHost ? currentHost.replace(/:\d+$/, "") : "ppms.local"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  This subdomain will serve your dedicated clinic profile, patient token booking, and consulting doctor roster.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClasses}>
                    <User className="w-3 h-3" />
                    <span>Administrator Name *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Rayan Chowdhury"
                      className={iconInputClasses}
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClasses}>
                    <Mail className="w-3 h-3" />
                    <span>Work Email Address *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@carewell.com"
                      className={iconInputClasses}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClasses}>
                    <Phone className="w-3 h-3" />
                    <span>Contact Phone</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880 1711-223344"
                      className={iconInputClasses}
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClasses}>
                    <Lock className="w-3 h-3" />
                    <span>Password (min. 6 chars) *</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={passwordInputClasses}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClasses}>
                  <MapPin className="w-3 h-3" />
                  <span>Chamber / Clinic Physical Address</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={clinicAddress}
                    onChange={(e) => setClinicAddress(e.target.value)}
                    placeholder="e.g. House 45, Road 11, Banani, Dhaka"
                    className={iconInputClasses}
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Package Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[var(--brand-primary)]" />
                  <span>Choose Package for 14-Day Free Trial</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {plans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? "border-[var(--brand-primary)] bg-[var(--brand-surface)]/40 shadow-xs ring-2 ring-[var(--brand-primary)]"
                            : "border-[var(--border-default)] hover:border-slate-300 dark:hover:border-slate-700 bg-[var(--bg-surface)]"
                        }`}
                      >
                        {plan.isPopular && (
                          <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-[var(--brand-primary)] text-white text-[8px] font-bold uppercase tracking-wider">
                            Popular
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {plan.name}
                        </h4>
                        <div className="flex items-baseline gap-1 my-1">
                          <span className="text-lg font-black text-slate-900 dark:text-white">
                            ${plan.price}
                          </span>
                          <span className="text-[10px] text-slate-400">/{plan.billingCycle}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1">
                          {plan.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Patient Registration Fields */
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClasses}>
                    <User className="w-3 h-3" />
                    <span>Full Name *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Fatima Rahman"
                      className={iconInputClasses}
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClasses}>
                    <Mail className="w-3 h-3" />
                    <span>Email Address *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="fatima@example.com"
                      className={iconInputClasses}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClasses}>
                    <Lock className="w-3 h-3" />
                    <span>Password (min. 6 chars) *</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={passwordInputClasses}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClasses}>
                    <Phone className="w-3 h-3" />
                    <span>Phone Number</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880 1811-000000"
                      className={iconInputClasses}
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClasses}>
                    <span>Gender</span>
                  </label>
                  <CustomSelect
                    value={gender}
                    onChange={(val) => setGender(val)}
                    options={[
                      { value: "Female", label: "Female" },
                      { value: "Male", label: "Male" },
                      { value: "Other", label: "Other" },
                    ]}
                    searchable={false}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={labelClasses}>
                    <span>Date of Birth</span>
                  </label>
                  <CustomDatePicker
                    value={dateOfBirth}
                    onChange={(val) => setDateOfBirth(val)}
                    maxDate={new Date().toISOString().split("T")[0]}
                    placeholder="Select birth date"
                    quickPresets={false}
                  />
                </div>
              </div>
              
              <div className="grid sm:grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClasses}>
                    <span>Primary Clinic</span>
                  </label>
                  <CustomSelect
                    value={organizationId}
                    onChange={(val) => setOrganizationId(val)}
                    options={orgs.map((org) => ({ value: org.id, label: org.name }))}
                    placeholder="Select clinic..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClasses}>
                  <span>Known Medical History / Allergies (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="e.g. Penicillin allergy, Hypertension, Asthma"
                  className={textareaClasses}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              (mode === "clinic" && (slugStatus !== "available" || !clinicSlug.trim()))
            }
            className="w-full py-3.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {mode === "clinic" ? "Creating Clinic Tenant..." : "Creating Account..."}
                </span>
              </>
            ) : (
              <>
                {mode === "clinic" ? (
                  <Sparkles className="w-4 h-4" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>
                  {mode === "clinic"
                    ? "Start 14-Day Free Trial & Setup Clinic"
                    : "Complete Registration"}
                </span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[var(--border-subtle)] text-center text-xs text-slate-500">
          <span>Already registered? </span>
          <Link
            href="/auth/login"
            className="font-bold text-[var(--brand-text)] hover:underline inline-flex items-center gap-1"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
