"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Check,
  CreditCard,
  Edit,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  X,
  Wand2,
  Eye,
  Settings2,
  Infinity as InfinityIcon,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { notifyToast } from "@/lib/toast";
import { CustomSelect } from "@/components/common/custom-select";

export type PricingPlanItem = {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  description?: string | null;
  features: string[];
  maxDoctors?: number | null;
  maxStaff?: number | null;
  maxPatients?: number | null;
  maxPrescriptionsPerMonth?: number | null;
  isPopular: boolean;
  isActive: boolean;
  createdAt: string;
};

interface CapabilityOption {
  id: string;
  labelEn: string;
  labelBn: string;
}

interface CustomBulletItem {
  id: string;
  text: string;
  checked: boolean;
}

const AVAILABLE_CAPABILITIES: CapabilityOption[] = [
  {
    id: "rx_pad",
    labelEn: "Digital Prescription Pad with A4 Printouts",
    labelBn: "ডিজিটাল প্রেসক্রিপশন প্যাড ও এ৪ প্রিন্ট সুবিধা",
  },
  {
    id: "live_queue",
    labelEn: "Live Waiting Hall TV Queue Monitor",
    labelBn: "লাইভ টিভি কিউ ডিসপ্লে (ওয়েটিং হল মনিটর)",
  },
  {
    id: "patient_portal",
    labelEn: "Patient Portal with Medicine Dosing Reminders",
    labelBn: "রোগী পোর্টাল ও স্বয়ংক্রিয় ঔষধ সেবন রিমাইন্ডার",
  },
  {
    id: "lab_reports",
    labelEn: "Diagnostic Lab Test Reports Management",
    labelBn: "ডায়াগনস্টিক ল্যাব রিপোর্ট ম্যানেজমেন্ট ও রিভিউ",
  },
  {
    id: "clinical_chat",
    labelEn: "Clinical Chat & Patient Consultations",
    labelBn: "ডাক্তার-রোগী সুরক্ষিত ক্লিনিক্যাল চ্যাট হাব",
  },
  {
    id: "custom_subdomain",
    labelEn: "Custom Clinic Subdomain & Digital Branding",
    labelBn: "ক্লিনিক সাবডোমেন ও নিজস্ব ডিজিটাল ব্র্যান্ডিং",
  },
  {
    id: "formulary_catalog",
    labelEn: "Drug Formulary & Diagnostic Test Catalog",
    labelBn: "ঔষধ ও ডায়াগনস্টিক টেস্ট ক্যাটালগ হাব",
  },
  {
    id: "templates",
    labelEn: "Reusable Prescription Templates & Presets",
    labelBn: "পুনর্ব্যবহারযোগ্য প্রেসক্রিপশন টেমপ্লেট ও প্রিসেট",
  },
  {
    id: "audit_logs",
    labelEn: "Activity Audit Logs & Security Tracking",
    labelBn: "সিস্টেম অডিট লগ ও কার্যক্রম ট্র্যাকিং",
  },
  {
    id: "priority_support",
    labelEn: "Priority 24/7 Support & Onboarding Assistance",
    labelBn: "২৪/৭ অগ্রাধিকার সাপোর্ট ও অনবোর্ডিং সহায়তা",
  },
];

export function SaasPricingManager() {
  const { t, language } = useLanguage();
  const [plans, setPlans] = useState<PricingPlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlanItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"configure" | "preview">("configure");

  // Form Fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(49);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [description, setDescription] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Quotas & Unlimited Controls
  const [isDoctorsUnlimited, setIsDoctorsUnlimited] = useState(false);
  const [doctorsCount, setDoctorsCount] = useState<number>(2);

  const [isPrescriptionsUnlimited, setIsPrescriptionsUnlimited] = useState(false);
  const [prescriptionsCount, setPrescriptionsCount] = useState<number>(500);

  const [isStaffUnlimited, setIsStaffUnlimited] = useState(false);
  const [staffCount, setStaffCount] = useState<number>(5);

  const [isPatientsUnlimited, setIsPatientsUnlimited] = useState(true);
  const [patientsCount, setPatientsCount] = useState<number>(1000);

  // Checkbox Capabilities
  const [selectedCapabilities, setSelectedCapabilities] = useState<Set<string>>(
    new Set(["rx_pad", "live_queue", "patient_portal", "lab_reports", "formulary_catalog", "templates"])
  );

  // Custom Bullets directly in the checkbox list
  const [customBullets, setCustomBullets] = useState<CustomBulletItem[]>([]);
  const [newBulletText, setNewBulletText] = useState("");

  const fetchPlans = () => {
    setLoading(true);
    fetch("/api/pricing-plans?all=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setPlans(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let isMounted = true;
    fetch("/api/pricing-plans?all=true")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data)) {
          setPlans(data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 100% REACTIVE AUTO-GENERATION OF ALL FEATURE POINTS FROM SELECTED VALUES
  // Zero manual sync buttons. Everything updates immediately when any option is changed.
  const generatedFeatures = useMemo(() => {
    const list: string[] = [];

    // 1. Doctor quota point
    if (isDoctorsUnlimited) {
      list.push(language === "bn" ? "সীমাহীন ডাক্তার অ্যাকাউন্ট" : "Unlimited Doctor Accounts");
    } else {
      list.push(
        language === "bn"
          ? `সর্বোচ্চ ${doctorsCount} জন ডাক্তার অ্যাকাউন্ট`
          : doctorsCount === 1
          ? "1 Doctor Account"
          : `Up to ${doctorsCount} Doctor Accounts`
      );
    }

    // 2. Prescription quota point
    if (isPrescriptionsUnlimited) {
      list.push(language === "bn" ? "সীমাহীন প্রেসক্রিপশন / মাস" : "Unlimited Prescriptions / month");
    } else {
      list.push(
        language === "bn"
          ? `${Number(prescriptionsCount).toLocaleString()} প্রেসক্রিপশন / মাস`
          : `${Number(prescriptionsCount).toLocaleString()} Prescriptions / month`
      );
    }

    // 3. Staff quota point
    if (isStaffUnlimited) {
      list.push(language === "bn" ? "সীমাহীন স্টাফ ও রিসেপশন অ্যাকাউন্ট" : "Unlimited Staff & Reception Accounts");
    } else {
      list.push(
        language === "bn"
          ? `সর্বোচ্চ ${staffCount} জন রিসেপশন ও স্টাফ অ্যাকাউন্ট`
          : staffCount === 1
          ? "1 Receptionist / Staff Account"
          : `Up to ${staffCount} Staff Accounts`
      );
    }

    // 4. Patient quota point
    if (isPatientsUnlimited) {
      list.push(language === "bn" ? "সীমাহীন রোগী প্রোফাইল ডেটাবেজ" : "Unlimited Patient Records");
    } else {
      list.push(
        language === "bn"
          ? `সর্বোচ্চ ${Number(patientsCount).toLocaleString()} জন রোগী প্রোফাইল`
          : `Up to ${Number(patientsCount).toLocaleString()} Patient Records`
      );
    }

    // 5. Selected built-in capability checkboxes
    AVAILABLE_CAPABILITIES.forEach((cap) => {
      if (selectedCapabilities.has(cap.id)) {
        list.push(language === "bn" ? cap.labelBn : cap.labelEn);
      }
    });

    // 6. Selected custom bullets from the checkbox list
    customBullets.forEach((bullet) => {
      if (bullet.checked && bullet.text.trim()) {
        list.push(bullet.text.trim());
      }
    });

    return list;
  }, [
    isDoctorsUnlimited,
    doctorsCount,
    isPrescriptionsUnlimited,
    prescriptionsCount,
    isStaffUnlimited,
    staffCount,
    isPatientsUnlimited,
    patientsCount,
    selectedCapabilities,
    customBullets,
    language,
  ]);

  // Auto-Fill 1-line description suggestion
  const handleAutoFillDescription = () => {
    let autoDesc = "";
    if (language === "bn") {
      if (isDoctorsUnlimited && isPrescriptionsUnlimited) {
        autoDesc = "বড় হাসপাতাল ও স্বাস্থ্যসেবা প্রতিষ্ঠানের জন্য সীমাহীন ডাক্তার, কর্মী এবং পূর্ণাঙ্গ অটোমেশন স্যুট।";
      } else if (!isDoctorsUnlimited && doctorsCount <= 2) {
        autoDesc = "একক চিকিৎসক ও প্রাইভেট কনসালটেন্সির জন্য দ্রুত প্রেসক্রিপশন ও রোগী ব্যবস্থাপনার স্টার্টার প্যাকেজ।";
      } else {
        autoDesc = `ক্রমবর্ধমান ক্লিনিকের জন্য সর্বোচ্চ ${doctorsCount} জন চিকিৎসক, লাইভ কিউ ডিসপ্লে এবং সমন্বিত স্বাস্থ্যসেবা প্যাকেজ।`;
      }
    } else {
      if (isDoctorsUnlimited && isPrescriptionsUnlimited) {
        autoDesc = "Comprehensive healthcare enterprise tier with unlimited doctor accounts and full clinical suite access.";
      } else if (!isDoctorsUnlimited && doctorsCount <= 2) {
        autoDesc = "Essential clinical tools tailored for solo medical practitioners, private consultancies, and small chambers.";
      } else {
        autoDesc = `Tailored for growing clinics with up to ${doctorsCount} doctor accounts, live waiting hall queues, and patient coordination.`;
      }
    }
    setDescription(autoDesc);
  };

  const toggleCapability = (capId: string) => {
    setSelectedCapabilities((prev) => {
      const next = new Set(prev);
      if (next.has(capId)) {
        next.delete(capId);
      } else {
        next.add(capId);
      }
      return next;
    });
  };

  // Add custom bullet directly into the checkbox list
  const handleAddCustomBullet = () => {
    if (!newBulletText.trim()) return;
    const item: CustomBulletItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      text: newBulletText.trim(),
      checked: true,
    };
    setCustomBullets((prev) => [...prev, item]);
    setNewBulletText("");
  };

  const toggleCustomBullet = (id: string) => {
    setCustomBullets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, checked: !b.checked } : b))
    );
  };

  const removeCustomBullet = (id: string) => {
    setCustomBullets((prev) => prev.filter((b) => b.id !== id));
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setName("");
    setPrice(49);
    setBillingCycle("monthly");
    setDescription("");
    setIsPopular(false);
    setIsActive(true);
    setError(null);
    setActiveModalTab("configure");

    // Default Quotas
    setIsDoctorsUnlimited(false);
    setDoctorsCount(2);

    setIsPrescriptionsUnlimited(false);
    setPrescriptionsCount(500);

    setIsStaffUnlimited(false);
    setStaffCount(5);

    setIsPatientsUnlimited(true);
    setPatientsCount(1000);

    setSelectedCapabilities(
      new Set(["rx_pad", "live_queue", "patient_portal", "lab_reports", "formulary_catalog", "templates"])
    );
    setCustomBullets([]);
    setNewBulletText("");

    // Auto-fill a clean default description
    if (language === "bn") {
      setDescription("একক চিকিৎসক ও প্রাইভেট কনসালটেন্সির জন্য দ্রুত প্রেসক্রিপশন ও রোগী ব্যবস্থাপনার স্টার্টার প্যাকেজ।");
    } else {
      setDescription("Essential clinical tools tailored for solo medical practitioners, private consultancies, and small chambers.");
    }

    setModalOpen(true);
  };

  const openEditModal = (plan: PricingPlanItem) => {
    setEditingPlan(plan);
    setName(plan.name);
    setPrice(plan.price);
    setBillingCycle(plan.billingCycle || "monthly");
    setDescription(plan.description || "");
    setIsPopular(plan.isPopular);
    setIsActive(plan.isActive);
    setError(null);
    setActiveModalTab("configure");

    // Load Doctor Quota
    if (plan.maxDoctors == null) {
      setIsDoctorsUnlimited(true);
      setDoctorsCount(5);
    } else {
      setIsDoctorsUnlimited(false);
      setDoctorsCount(plan.maxDoctors);
    }

    // Load Prescription Quota
    if (plan.maxPrescriptionsPerMonth == null) {
      setIsPrescriptionsUnlimited(true);
      setPrescriptionsCount(1000);
    } else {
      setIsPrescriptionsUnlimited(false);
      setPrescriptionsCount(plan.maxPrescriptionsPerMonth);
    }

    // Load Staff Quota
    if (plan.maxStaff == null) {
      setIsStaffUnlimited(true);
      setStaffCount(10);
    } else {
      setIsStaffUnlimited(false);
      setStaffCount(plan.maxStaff);
    }

    // Load Patient Quota
    if (plan.maxPatients == null) {
      setIsPatientsUnlimited(true);
      setPatientsCount(1000);
    } else {
      setIsPatientsUnlimited(false);
      setPatientsCount(plan.maxPatients);
    }

    // Identify which capabilities are active in existing plan, and any custom bullets
    const existingFeatures = Array.isArray(plan.features) ? plan.features : [];
    const matchedCapIds = new Set<string>();
    const extraBullets: CustomBulletItem[] = [];

    existingFeatures.forEach((feat, idx) => {
      const lower = feat.toLowerCase();
      // Skip quota lines as they are generated by the quota inputs
      if (
        lower.includes("doctor account") ||
        lower.includes("ডাক্তার অ্যাকাউন্ট") ||
        lower.includes("prescription") ||
        lower.includes("প্রেসক্রিপশন") ||
        lower.includes("staff account") ||
        lower.includes("স্টাফ অ্যাকাউন্ট") ||
        lower.includes("patient record") ||
        lower.includes("রোগী প্রোফাইল")
      ) {
        return;
      }

      // Check if matches one of the standard capability labels
      const matchedCap = AVAILABLE_CAPABILITIES.find(
        (c) =>
          c.labelEn.toLowerCase() === lower ||
          c.labelBn.toLowerCase() === lower ||
          lower.includes(c.labelEn.toLowerCase().slice(0, 15))
      );

      if (matchedCap) {
        matchedCapIds.add(matchedCap.id);
      } else {
        // Custom feature bullet
        extraBullets.push({
          id: `custom_${idx}_${Date.now()}`,
          text: feat,
          checked: true,
        });
      }
    });

    if (matchedCapIds.size === 0) {
      // Default to core capabilities if none matched
      matchedCapIds.add("rx_pad");
      matchedCapIds.add("live_queue");
      matchedCapIds.add("patient_portal");
    }

    setSelectedCapabilities(matchedCapIds);
    setCustomBullets(extraBullets);
    setNewBulletText("");

    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const endpoint = editingPlan
        ? `/api/pricing-plans/${editingPlan.id}`
        : "/api/pricing-plans";
      const method = editingPlan ? "PATCH" : "POST";

      const payload = {
        name,
        price: Number(price),
        billingCycle,
        description: description.trim() || null,
        // All points auto-generated directly from selected values
        features: generatedFeatures,
        isPopular,
        isActive,
        maxDoctors: isDoctorsUnlimited ? null : Number(doctorsCount),
        maxPrescriptionsPerMonth: isPrescriptionsUnlimited ? null : Number(prescriptionsCount),
        maxStaff: isStaffUnlimited ? null : Number(staffCount),
        maxPatients: isPatientsUnlimited ? null : Number(patientsCount),
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        notifyToast(
          editingPlan ? t.pricingPlanUpdatedSuccess : t.pricingPlanCreatedSuccess,
          "success"
        );
        fetchPlans();
      } else {
        const message = data.message || t.pricingPlanSaveError;
        setError(message);
        notifyToast(message, "error");
      }
    } catch {
      const message = t.pricingPlanNetworkError;
      setError(message);
      notifyToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this pricing plan?")) return;
    try {
      const res = await fetch(`/api/pricing-plans/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPlans((prev) => prev.filter((p) => p.id !== id));
        notifyToast(t.pricingPlanDeletedSuccess, "success");
      } else {
        notifyToast(data.message || t.pricingPlanDeleteError, "error");
      }
    } catch {
      notifyToast(t.pricingPlanDeleteNetworkError, "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.saasPricingTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {t.saasPricingSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-lg bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addPricingTier}</span>
        </button>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--brand-primary)] mb-2" />
          <span>{t("uiLoadingSaaSPlans")}</span>
        </div>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-slate-400">
          {t("uiNoPricingPlansConfigured")}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-7 rounded-xl bg-[var(--bg-surface)] border transition flex flex-col justify-between space-y-6 shadow-xs relative ${
                plan.isPopular
                  ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20"
                  : "border-[var(--border-subtle)]"
              } ${!plan.isActive ? "opacity-60 border-dashed" : ""}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--brand-primary)] text-white font-bold text-[10px] tracking-wide uppercase flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  <span>{t.mostPopularTier}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      plan.isActive
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {plan.isActive ? t("uiActive") : "INACTIVE"}
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-xs text-slate-400">
                      / {plan.billingCycle || "month"}
                    </span>
                  </div>
                  {plan.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {plan.description}
                    </p>
                  )}
                </div>

                {/* Quotas Summary */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)]">
                  <div className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {language === "bn" ? "ডাক্তার কোটা" : "Doctors"}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {plan.maxDoctors == null ? "Unlimited ∞" : `${plan.maxDoctors}`}
                    </span>
                  </div>

                  <div className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {language === "bn" ? "প্রেসক্রিপশন / মাস" : "Rx / Month"}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {plan.maxPrescriptionsPerMonth == null
                        ? "Unlimited ∞"
                        : `${plan.maxPrescriptionsPerMonth.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {language === "bn" ? "স্টাফ কোটা" : "Staff"}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {plan.maxStaff == null ? "Unlimited ∞" : `${plan.maxStaff}`}
                    </span>
                  </div>

                  <div className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {language === "bn" ? "রোগী কোটা" : "Patients"}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {plan.maxPatients == null
                        ? "Unlimited ∞"
                        : `${plan.maxPatients.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-[var(--border-subtle)]">
                  {Array.isArray(plan.features) &&
                    plan.features.slice(0, 6).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  {Array.isArray(plan.features) && plan.features.length > 6 && (
                    <li className="text-[11px] text-slate-400 font-semibold pl-6">
                      +{plan.features.length - 6} more capabilities
                    </li>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(plan)}
                  className="flex-1 py-2 px-3 rounded-xl border border-[var(--border-default)] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{t.edit}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(plan.id)}
                  className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-500/10 text-rose-500 transition cursor-pointer"
                  title={t.delete}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advanced SaaS Pricing Modal with Live Preview & Reactive Auto-Generation */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-5xl rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl modal-container max-h-[calc(100dvh-1.5rem)] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="modal-header shrink-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center font-bold">
                  <Settings2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {editingPlan ? `${t("uiEditPlan")}: ${editingPlan.name}` : t("uiCreateSaaSPricingPlan")}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {t("uiAllPointsGeneratedDirectly")}
                  </p>
                </div>
              </div>

              {/* Mobile Tab Toggle */}
              <div className="flex items-center gap-2">
                <div className="flex lg:hidden bg-[var(--bg-app)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveModalTab("configure")}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      activeModalTab === "configure"
                        ? "bg-[var(--brand-primary)] text-white shadow-xs"
                        : "text-slate-500"
                    }`}
                  >
                    Configure
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModalTab("preview")}
                    className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                      activeModalTab === "preview"
                        ? "bg-[var(--brand-primary)] text-white shadow-xs"
                        : "text-slate-500"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Split 2-Column on LG */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="modal-body flex-1 overflow-y-auto p-4 sm:p-6">
                {error && (
                  <div className="p-3.5 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Form Configuration */}
                  <div
                    className={`space-y-5 lg:col-span-7 ${
                      activeModalTab === "preview" ? "hidden lg:block" : "block"
                    }`}
                  >
                    {/* Basic Tier Properties */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1 space-y-1">
                        <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                          {t("uiPlanName")}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Solo Clinic, Clinic Pro"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)] font-bold text-sm min-h-[46px]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                          {t("uiPriceUSDMo")} ($)
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          step={1}
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)] font-bold text-sm min-h-[46px]"
                        />
                      </div>

                      <div className="space-y-1">
                        <CustomSelect
                          label={language === "bn" ? "বিলিং সাইকেল" : "Billing Cycle"}
                          value={billingCycle}
                          onChange={(val) => setBillingCycle(val)}
                          options={[
                            { value: "monthly", label: language === "bn" ? "মাসিক (Monthly)" : "Monthly Billing" },
                            { value: "yearly", label: language === "bn" ? "বার্ষিক (Yearly)" : "Yearly Billing" },
                          ]}
                          allowClear={false}
                          searchable={false}
                        />
                      </div>
                    </div>

                    {/* Clean 1-Line Plan Description with Auto-Fill helper */}
                    <div className="space-y-1.5 p-3.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                      <div className="flex items-center justify-between">
                        <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                          {t("uiShortDescription")}
                        </label>
                        <button
                          type="button"
                          onClick={handleAutoFillDescription}
                          className="flex items-center gap-1 text-[11px] font-bold text-[var(--brand-primary)] hover:underline cursor-pointer"
                          title="Auto-fill 1-line description suggestion"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>{t("uiAutoFillDescription")}</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Essential clinical tools tailored for solo medical practitioners and small chambers."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-slate-900 dark:text-white text-xs min-h-[42px]"
                      />
                    </div>

                    {/* SaaS Quota Limitations & Unlimited Controls */}
                    <div className="space-y-2.5 p-4 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                        <div>
                          <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            {language === "bn" ? "কোটা ও ব্যবহার সীমা নিয়ন্ত্রণ" : "Quota & Capacity Controls"}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {language === "bn"
                              ? "সীমাহীন রাখতে Unlimited বাটনে চাপুন অথবা নির্দিষ্ট সংখ্যা দিন"
                              : "Toggle Unlimited (∞) for unconstrained access or specify numerical limit"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        {/* 1. Doctor Quota */}
                        <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {language === "bn" ? "ডাক্তার সংখ্যা" : "Doctor Accounts"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsDoctorsUnlimited((prev) => !prev)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                isDoctorsUnlimited
                                  ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              <InfinityIcon className="w-3 h-3" />
                              <span>{isDoctorsUnlimited ? t("uiUnlimitedBadge") : t("uiSetUnlimited")}</span>
                            </button>
                          </div>
                          {isDoctorsUnlimited ? (
                            <div className="py-2 text-center text-xs font-bold text-purple-600 bg-purple-500/5 rounded-lg border border-purple-500/10">
                              ∞ {language === "bn" ? "সীমাহীন ডাক্তার" : "Unlimited Doctors"}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={1}
                                step={1}
                                value={doctorsCount}
                                onChange={(e) => setDoctorsCount(Math.max(1, Number(e.target.value)))}
                                className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-xs font-bold text-slate-900 dark:text-white"
                              />
                              <span className="text-xs text-slate-400 font-semibold shrink-0">docs</span>
                            </div>
                          )}
                        </div>

                        {/* 2. Prescription Monthly Limit */}
                        <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {language === "bn" ? "প্রেসক্রিপশন / মাস" : "Rx / Month"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsPrescriptionsUnlimited((prev) => !prev)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                isPrescriptionsUnlimited
                                  ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              <InfinityIcon className="w-3 h-3" />
                              <span>{isPrescriptionsUnlimited ? t("uiUnlimitedBadge") : t("uiSetUnlimited")}</span>
                            </button>
                          </div>
                          {isPrescriptionsUnlimited ? (
                            <div className="py-2 text-center text-xs font-bold text-purple-600 bg-purple-500/5 rounded-lg border border-purple-500/10">
                              ∞ {language === "bn" ? "সীমাহীন প্রেসক্রিপশন" : "Unlimited Prescriptions"}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={50}
                                step={50}
                                value={prescriptionsCount}
                                onChange={(e) => setPrescriptionsCount(Math.max(1, Number(e.target.value)))}
                                className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-xs font-bold text-slate-900 dark:text-white"
                              />
                              <span className="text-xs text-slate-400 font-semibold shrink-0">rx/mo</span>
                            </div>
                          )}
                        </div>

                        {/* 3. Staff Accounts */}
                        <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {language === "bn" ? "স্টাফ ও রিসেপশন" : "Staff Accounts"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsStaffUnlimited((prev) => !prev)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                isStaffUnlimited
                                  ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              <InfinityIcon className="w-3 h-3" />
                              <span>{isStaffUnlimited ? t("uiUnlimitedBadge") : t("uiSetUnlimited")}</span>
                            </button>
                          </div>
                          {isStaffUnlimited ? (
                            <div className="py-2 text-center text-xs font-bold text-purple-600 bg-purple-500/5 rounded-lg border border-purple-500/10">
                              ∞ {language === "bn" ? "সীমাহীন স্টাফ" : "Unlimited Staff"}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={1}
                                step={1}
                                value={staffCount}
                                onChange={(e) => setStaffCount(Math.max(1, Number(e.target.value)))}
                                className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-xs font-bold text-slate-900 dark:text-white"
                              />
                              <span className="text-xs text-slate-400 font-semibold shrink-0">staff</span>
                            </div>
                          )}
                        </div>

                        {/* 4. Patient Profiles */}
                        <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {language === "bn" ? "সর্বোচ্চ রোগী সংখ্যা" : "Patient Records"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsPatientsUnlimited((prev) => !prev)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                isPatientsUnlimited
                                  ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              <InfinityIcon className="w-3 h-3" />
                              <span>{isPatientsUnlimited ? t("uiUnlimitedBadge") : t("uiSetUnlimited")}</span>
                            </button>
                          </div>
                          {isPatientsUnlimited ? (
                            <div className="py-2 text-center text-xs font-bold text-purple-600 bg-purple-500/5 rounded-lg border border-purple-500/10">
                              ∞ {language === "bn" ? "সীমাহীন রোগী" : "Unlimited Patients"}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={100}
                                step={100}
                                value={patientsCount}
                                onChange={(e) => setPatientsCount(Math.max(1, Number(e.target.value)))}
                                className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-xs font-bold text-slate-900 dark:text-white"
                              />
                              <span className="text-xs text-slate-400 font-semibold shrink-0">patients</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Capabilities & Custom Bullets List */}
                    <div className="space-y-3 p-4 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                      <div className="pb-2 border-b border-[var(--border-subtle)]">
                        <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          {t("uiClinicalCapabilities")}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {language === "bn"
                            ? "সুবিধাসমূহ টিক দিন। কাস্টম সুবিধা যোগ করতে নিচে টাইপ করুন।"
                            : "Toggle checkboxes to include capabilities. Add custom items below."}
                        </p>
                      </div>

                      {/* Capabilities Checkboxes List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                        {/* Standard Capabilities */}
                        {AVAILABLE_CAPABILITIES.map((cap) => {
                          const isChecked = selectedCapabilities.has(cap.id);
                          return (
                            <label
                              key={cap.id}
                              className={`p-2.5 rounded-xl border text-[11px] font-medium flex items-center gap-2 cursor-pointer transition select-none ${
                                isChecked
                                  ? "bg-[var(--brand-surface)] border-[var(--brand-primary)]/40 text-slate-900 dark:text-white font-bold"
                                  : "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCapability(cap.id)}
                                className="w-3.5 h-3.5 accent-[var(--brand-primary)] rounded cursor-pointer"
                              />
                              <span className="truncate">
                                {language === "bn" ? cap.labelBn : cap.labelEn}
                              </span>
                            </label>
                          );
                        })}

                        {/* Custom Added Bullets directly in this list */}
                        {customBullets.map((bullet) => (
                          <div
                            key={bullet.id}
                            className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between gap-2 transition ${
                              bullet.checked
                                ? "bg-amber-500/10 border-amber-500/30 text-slate-900 dark:text-white font-bold"
                                : "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-slate-400 opacity-60"
                            }`}
                          >
                            <label className="flex items-center gap-2 cursor-pointer truncate flex-1 select-none">
                              <input
                                type="checkbox"
                                checked={bullet.checked}
                                onChange={() => toggleCustomBullet(bullet.id)}
                                className="w-3.5 h-3.5 accent-amber-500 rounded cursor-pointer shrink-0"
                              />
                              <span className="truncate">{bullet.text}</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => removeCustomBullet(bullet.id)}
                              className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition cursor-pointer shrink-0"
                              title="Delete custom bullet"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Custom Bullet Field directly into this list */}
                      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={t("uiCustomBulletPlaceholder")}
                          value={newBulletText}
                          onChange={(e) => setNewBulletText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCustomBullet();
                            }
                          }}
                          className="flex-1 px-3.5 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)]"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomBullet}
                          className="px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold hover:opacity-95 transition cursor-pointer shrink-0 flex items-center gap-1 shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t("uiAddFeature")}</span>
                        </button>
                      </div>
                    </div>

                    {/* Popular & Active Toggles */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isPopular}
                          onChange={(e) => setIsPopular(e.target.checked)}
                          className="w-4 h-4 accent-[var(--brand-primary)] rounded cursor-pointer"
                        />
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {t.mostPopularTier}
                        </span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="w-4 h-4 accent-[var(--brand-primary)] rounded cursor-pointer"
                        />
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {t("uiLiveOnLandingPage")}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Right Column: Real-Time Live Preview Card */}
                  <div
                    className={`lg:col-span-5 space-y-3 ${
                      activeModalTab === "configure" ? "hidden lg:block" : "block"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <Eye className="w-4 h-4 text-[var(--brand-primary)]" />
                        <span>{t("uiLivePlanPreview")}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                        {language === "bn" ? "স্বয়ংক্রিয় লাইভ প্রিভিউ" : "Auto Live Preview"}
                      </span>
                    </div>

                    {/* Preview Pricing Card (Exact UI as rendered in landing & billing) */}
                    <div
                      className={`p-6 sm:p-7 rounded-xl bg-[var(--bg-surface)] border transition flex flex-col justify-between space-y-5 shadow-lg relative ${
                        isPopular
                          ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20"
                          : "border-[var(--border-default)]"
                      } ${!isActive ? "opacity-60 border-dashed" : ""}`}
                    >
                      {isPopular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--brand-primary)] text-white font-bold text-[10px] tracking-wide uppercase flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3 h-3" />
                          <span>{t.mostPopularTier}</span>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white">
                            {name || (language === "bn" ? "প্যাকেজের নাম" : "Plan Name")}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isActive
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {isActive ? t("uiActive") : "INACTIVE"}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">
                              ${price}
                            </span>
                            <span className="text-xs text-slate-400">
                              / {billingCycle || "month"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-2 min-h-[32px] leading-relaxed">
                            {description ||
                              (language === "bn"
                                ? "এখানে প্যাকেজের সংক্ষিপ্ত বিবরণ প্রদর্শিত হবে।"
                                : "Plan summary and clinical target audience appears here.")}
                          </p>
                        </div>

                        {/* Quotas Badges */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)] text-[11px]">
                          <div className="p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              {language === "bn" ? "ডাক্তার" : "Doctors"}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {isDoctorsUnlimited ? "Unlimited ∞" : `${doctorsCount} accounts`}
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              {language === "bn" ? "প্রেসক্রিপশন" : "Rx / Month"}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {isPrescriptionsUnlimited ? "Unlimited ∞" : `${prescriptionsCount.toLocaleString()} / mo`}
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              {language === "bn" ? "স্টাফ" : "Staff"}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {isStaffUnlimited ? "Unlimited ∞" : `${staffCount} accounts`}
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              {language === "bn" ? "রোগী" : "Patients"}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {isPatientsUnlimited ? "Unlimited ∞" : `${patientsCount.toLocaleString()}`}
                            </span>
                          </div>
                        </div>

                        {/* Auto-Generated Features Preview */}
                        <div className="space-y-2 pt-3 border-t border-[var(--border-subtle)]">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {language === "bn"
                              ? `অন্তর্ভুক্ত সুবিধাসমূহ (${generatedFeatures.length})`
                              : `Auto-Generated Points (${generatedFeatures.length})`}
                          </p>
                          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 max-h-56 overflow-y-auto pr-1">
                            {generatedFeatures.map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-2 animate-in fade-in duration-100">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="leading-tight">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Mock Action Button */}
                      <div className="pt-2">
                        <div className="w-full py-2.5 rounded-lg bg-[var(--brand-primary)] text-white text-xs font-bold text-center shadow-xs">
                          {language === "bn" ? "প্যাকেজটি নির্বাচন করুন" : "Select Subscription Plan"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer shrink-0 flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-default)] text-slate-600 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-[var(--brand-primary)] text-white font-bold cursor-pointer hover:opacity-90 disabled:opacity-50 transition shadow-xs text-xs flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t("uiSaving")}</span>
                    </>
                  ) : (
                    <span>{t.save}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
