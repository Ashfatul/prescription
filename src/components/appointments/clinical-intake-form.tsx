"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Plus,
  ShieldAlert,
  Utensils,
  Activity,
  Check,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export const COMMON_DISEASES = [
  "Diabetes Mellitus (Type 1)",
  "Diabetes Mellitus (Type 2)",
  "Hypertension (High BP)",
  "Asthma / COPD",
  "Ischemic Heart Disease (IHD/CAD)",
  "Chronic Kidney Disease (CKD)",
  "Thyroid Disorder (Hypo/Hyper)",
  "Gastritis / Peptic Ulcer / GERD",
  "Stroke / TIA",
  "Liver Disease / Hepatitis",
  "Cancer / Chemotherapy History",
  "Rheumatoid Arthritis / Gout",
  "Dyslipidemia (High Cholesterol)",
];

export const COMMON_ALLERGIES = [
  "Penicillin",
  "Sulfa Drugs (Sulfonamides)",
  "NSAIDs (Aspirin/Ibuprofen/Naproxen)",
  "Cephalosporins",
  "Paracetamol / Acetaminophen",
  "Latex Sensitivity",
  "Dust & Pollen (Environmental)",
  "Seafood & Shellfish",
  "Peanuts & Tree Nuts",
  "Eggs & Dairy Products",
  "Ciprofloxacin / Fluoroquinolones",
];

export const CLINICAL_FLAGS = [
  "Currently on Blood Thinners / Anticoagulants",
  "Currently Pregnant",
  "Currently Breastfeeding / Lactating",
  "Cardiac Pacemaker / Stent / Implant",
  "Recent Surgery (< 6 months)",
  "Bleeding Disorder / Hemophilia",
  "Active Smoker / Tobacco Consumer",
  "Regular Alcohol Consumption",
  "Immunocompromised / On Steroids",
];

export const DIET_OPTIONS = [
  "Low Sugar / Diabetic Diet",
  "Low Sodium / Salt (< 2g/day) / DASH",
  "Low Fat / Low Cholesterol",
  "Renal Diet (Low Protein & Potassium)",
  "High Fiber & Roughage Diet",
  "Soft / Liquid / Bland Diet",
  "Gluten-Free Diet",
  "Fluid Restriction (< 1.5 Liters/Day)",
];

export interface ClinicalIntakeData {
  diseases: string[];
  allergies: string[];
  medicalFlags: string[];
  dietRequired: boolean;
  dietInstructions: string[];
  dietNotes: string;
}

interface ClinicalIntakeFormProps {
  value: ClinicalIntakeData;
  onChange: (data: ClinicalIntakeData) => void;
}

export function ClinicalIntakeForm({
  value,
  onChange,
}: ClinicalIntakeFormProps) {
  const { t, language } = useLanguage();
  const [customDisease, setCustomDisease] = useState("");
  const [customAllergy, setCustomAllergy] = useState("");

  const toggleItem = (
    field: "diseases" | "allergies" | "medicalFlags" | "dietInstructions",
    item: string
  ) => {
    const list = value[field];
    const exists = list.includes(item);
    const updated = exists ? list.filter((i) => i !== item) : [...list, item];
    onChange({ ...value, [field]: updated });
  };

  const handleAddCustomDisease = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customDisease.trim();
    if (!trimmed || value.diseases.includes(trimmed)) return;
    onChange({ ...value, diseases: [...value.diseases, trimmed] });
    setCustomDisease("");
  };

  const handleAddCustomAllergy = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customAllergy.trim();
    if (!trimmed || value.allergies.includes(trimmed)) return;
    onChange({ ...value, allergies: [...value.allergies, trimmed] });
    setCustomAllergy("");
  };

  return (
    <div className="space-y-5 text-left">
      {/* 1. PREVIOUS DISEASES / CHRONIC CONDITIONS */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>{t("uiPreviousDiseasesChronicConditions")}</span>
          </label>
          {value.diseases.length > 0 && (
            <span className="text-[10px] font-bold text-[var(--brand-text)] px-2 py-0.5 rounded-full bg-[var(--brand-surface)] border border-[var(--brand-border)]">
              {value.diseases.length} {t("uiSelected")}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500">
          {t("uiSelectAllMedicalHistoryThat")}
        </p>

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {COMMON_DISEASES.map((disease) => {
            const isSelected = value.diseases.includes(disease);
            return (
              <button
                key={disease}
                type="button"
                onClick={() => toggleItem("diseases", disease)}
                className={`text-xs px-2.5 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[var(--brand-surface)] text-[var(--brand-text)] border-[var(--brand-primary)] font-bold shadow-2xs"
                    : "bg-[var(--bg-surface)] text-slate-600 dark:text-slate-300 border-[var(--border-subtle)] hover:border-[var(--brand-border)]"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-[var(--brand-primary)]" />}
                <span>{disease}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Disease Input */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={customDisease}
            onChange={(e) => setCustomDisease(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCustomDisease(e)}
            placeholder={t("uiAddOtherDiseaseEG")}
            className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:border-[var(--brand-primary)]"
          />
          <button
            type="button"
            onClick={() => handleAddCustomDisease()}
            className="px-3 py-1.5 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] text-xs font-bold border border-[var(--brand-border)] hover:bg-[var(--brand-primary)] hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.add}</span>
          </button>
        </div>
      </div>

      {/* 2. DRUG & ENVIRONMENTAL ALLERGIES */}
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>{t.knownAllergies}</span>
          </label>
          {value.allergies.length > 0 && (
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 border border-rose-300 dark:border-rose-800">
              {value.allergies.length} {t("uiRecorded")}
            </span>
          )}
        </div>
        <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80">
          {t("uiCriticalClinicalSafetyFlagsDrugs")}
        </p>

        {/* Allergy Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {COMMON_ALLERGIES.map((allergy) => {
            const isSelected = value.allergies.includes(allergy);
            return (
              <button
                key={allergy}
                type="button"
                onClick={() => toggleItem("allergies", allergy)}
                className={`text-xs px-2.5 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-rose-600 text-white border-rose-600 font-bold shadow-xs"
                    : "bg-[var(--bg-surface)] text-slate-700 dark:text-slate-300 border-rose-200 dark:border-rose-900/60 hover:border-rose-400"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
                <span>{allergy}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Allergy Input */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={customAllergy}
            onChange={(e) => setCustomAllergy(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCustomAllergy(e)}
            placeholder={t("uiAddOtherAllergenEG")}
            className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:border-rose-500"
          />
          <button
            type="button"
            onClick={() => handleAddCustomAllergy()}
            className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 text-xs font-bold border border-rose-300 dark:border-rose-700 hover:bg-rose-600 hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.add}</span>
          </button>
        </div>
      </div>

      {/* 3. CRITICAL CLINICAL FLAGS (WHAT DOCTOR SHOULD KNOW) */}
      <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t("uiOtherThingsDoctorShouldKnow")}</span>
          </label>
          {value.medicalFlags.length > 0 && (
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-800">
              {value.medicalFlags.length} {t("uiFlags")}
            </span>
          )}
        </div>
        <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
          {t("uiMedicationWarningsPhysiologicalStatesSurgeries")}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {CLINICAL_FLAGS.map((flag) => {
            const isSelected = value.medicalFlags.includes(flag);
            return (
              <button
                key={flag}
                type="button"
                onClick={() => toggleItem("medicalFlags", flag)}
                className={`text-xs px-2.5 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-xs"
                    : "bg-[var(--bg-surface)] text-slate-700 dark:text-slate-300 border-amber-200 dark:border-amber-900/60 hover:border-amber-400"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-slate-950" />}
                <span>{flag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. DIET CONTROL & DIETARY GUIDANCE */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {t("uiDietControlDietaryGuidance")}
              </span>
              <span className="text-[11px] text-slate-500">
                {t("uiCheckIfDoctorAdviceOr")}
              </span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value.dietRequired}
              onChange={(e) => onChange({ ...value, dietRequired: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {value.dietRequired && (
          <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)] animate-fadeIn">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
              {t("uiSelectRecommendedDietaryControls")}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {DIET_OPTIONS.map((diet) => {
                const isSelected = value.dietInstructions.includes(diet);
                return (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => toggleItem("dietInstructions", diet)}
                    className={`text-xs px-2.5 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500 font-bold"
                        : "bg-[var(--bg-app)] text-slate-600 dark:text-slate-300 border-[var(--border-subtle)] hover:border-emerald-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                    <span>{diet}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                {t("uiSpecificDietaryInstructionsDoctorAdvice")}
              </label>
              <textarea
                rows={2}
                value={value.dietNotes}
                onChange={(e) => onChange({ ...value, dietNotes: e.target.value })}
                placeholder={t("uiEGAvoidOilyAnd")}
                className="w-full text-xs p-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-app)] text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
