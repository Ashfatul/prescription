"use client";

import { useState } from "react";
import {
  HeartPulse,
  Printer,
  ShieldCheck,
  Tv,
  Pill,
  CheckCircle2,
  Volume2,
  Bell,
  FileText,
  User,
  QrCode,
  Plus,
  X,
  Clock,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { notifyToast } from "@/lib/toast";

interface MedicineItem {
  id: string;
  name: string;
  generic: string;
  dose: string;
  timing: string;
  duration: string;
}

interface ComplaintPreset {
  id: string;
  en: string;
  bn: string;
}

const COMPLAINT_PRESETS: ComplaintPreset[] = [
  { id: "fever", en: "Fever x 3 days", bn: "জ্বর ৩ দিন" },
  { id: "cough", en: "Dry cough", bn: "শুকনো কাশি" },
  { id: "throat", en: "Throat pain", bn: "গলা ব্যথা" },
  { id: "epigastric", en: "Epigastric pain", bn: "গ্যাস্ট্রিক সমস্যা" },
  { id: "headache", en: "Headache", bn: "মাথা ব্যথা" },
];

export function ClinicalStudioPreview() {
  const { t, language } = useLanguage();
  const isBn = language === "bn";

  const [activeTab, setActiveTab] = useState<"prescription" | "queue" | "patient">("prescription");
  const [selectedComplaintIds, setSelectedComplaintIds] = useState<string[]>(["fever", "cough"]);

  const allAvailableMedicines: MedicineItem[] = [
    {
      id: "napa",
      name: "Tab. Napa Extra 500mg+65mg",
      generic: isBn ? "প্যারাসিটামল + ক্যাফেইন" : "Paracetamol + Caffeine",
      dose: isBn ? "১+০+১" : "1+0+1",
      timing: isBn ? "খাবারের পরে" : "After meal",
      duration: isBn ? "৫ দিন" : "5 days",
    },
    {
      id: "maxpro",
      name: "Cap. Maxpro 20mg",
      generic: isBn ? "ইসোমিপ্রাজল ম্যাগনেসিয়াম" : "Esomeprazole Magnesium",
      dose: isBn ? "১+০+১" : "1+0+1",
      timing: isBn ? "খাবারের ৩০ মিনিট পূর্বে" : "30 mins before meal",
      duration: isBn ? "১৪ দিন" : "14 days",
    },
    {
      id: "azithro",
      name: "Tab. Azithrocin 500mg",
      generic: isBn ? "অ্যাজিথ্রোমাইসিন" : "Azithromycin Monohydrate",
      dose: isBn ? "০+০+১" : "0+0+1",
      timing: isBn ? "খাবারের ১ ঘণ্টা আগে" : "1 hour before meal",
      duration: isBn ? "৩ দিন" : "3 days",
    },
    {
      id: "monas",
      name: "Tab. Monas 10mg",
      generic: isBn ? "মন্টেলুকাস্ট সোডিয়াম" : "Montelukast Sodium",
      dose: isBn ? "০+০+১" : "0+0+1",
      timing: isBn ? "রাতে শোবার আগে" : "At bedtime",
      duration: isBn ? "১ মাস" : "1 month",
    },
  ];

  const [prescribedMedIds, setPrescribedMedIds] = useState<string[]>(["napa", "maxpro"]);

  const toggleMedicine = (medId: string) => {
    if (prescribedMedIds.includes(medId)) {
      if (prescribedMedIds.length > 1) {
        setPrescribedMedIds(prescribedMedIds.filter((id) => id !== medId));
      } else {
        notifyToast(
          isBn ? "অন্তত একটি ওষুধ তালিকায় থাকতে হবে।" : "Keep at least one medication.",
          "info",
        );
      }
    } else {
      setPrescribedMedIds([...prescribedMedIds, medId]);
      notifyToast(
        isBn ? "ওষুধ প্রেসক্রিপশনে যুক্ত হয়েছে" : "Medication added to prescription",
        "success",
      );
    }
  };

  const toggleComplaint = (compId: string) => {
    if (selectedComplaintIds.includes(compId)) {
      if (selectedComplaintIds.length > 1) {
        setSelectedComplaintIds(selectedComplaintIds.filter((c) => c !== compId));
      }
    } else {
      setSelectedComplaintIds([...selectedComplaintIds, compId]);
    }
  };

  const [currentToken, setCurrentToken] = useState<number>(14);
  const [calledNotice, setCalledNotice] = useState<string | null>(null);

  const callNextPatient = () => {
    const nextToken = currentToken + 1;
    setCurrentToken(nextToken);
    setCalledNotice(
      isBn ? `টোকেন #${nextToken} ডাকা হয়েছে` : `Calling Token #${nextToken}`,
    );
    notifyToast(
      isBn
        ? `চেম্বার ৩০২: টোকেন #${nextToken} কল করা হয়েছে`
        : `Chamber 302: Token #${nextToken} Called`,
      "success",
    );
  };

  const activeMedicines = allAvailableMedicines.filter((m) =>
    prescribedMedIds.includes(m.id),
  );
  const availableToAdd = allAvailableMedicines.filter(
    (m) => !prescribedMedIds.includes(m.id),
  );

  return (
    <div className="relative w-full">
      {/* Main Studio Frame */}
      <div className="relative z-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-[var(--shadow-elevated)] overflow-hidden flex flex-col">
        {/* Top Studio Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/70 px-3.5 py-2.5">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setActiveTab("prescription")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "prescription"
                  ? "bg-[var(--brand-primary)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>{t.landingTabPrescription}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("queue")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "queue"
                  ? "bg-[var(--brand-primary)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{t.landingTabQueue}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("patient")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "patient"
                  ? "bg-[var(--brand-primary)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{t.landingTabPatient}</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t("uiSystemActive")}</span>
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: SPLIT-PANE CLINICAL PRESCRIPTION WORKBENCH          */}
        {/* ========================================================= */}
        {activeTab === "prescription" && (
          <div className="flex flex-col">
            {/* Clinic Letterhead Header Strip */}
            <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] shrink-0" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight truncate">
                    {t("uiMetropolitanSpecializedHospital")}
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  <strong className="font-semibold text-[var(--text-primary)]">
                    {t("uiDrFahimRahman")}
                  </strong>{" "}
                  <span className="text-[var(--text-muted)]">
                    {t("uiMbbsFCPSMedicine")}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-[var(--text-muted)] hidden sm:inline">
                  {t("uiBmdcRegAChamber")}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--brand-surface)] border border-[var(--brand-border)] text-[var(--brand-text)] text-[11px] font-semibold">
                  <Printer className="w-3 h-3" />
                  <span>{t("uiA4Verified")}</span>
                </span>
              </div>
            </div>

            {/* 2-Column Split Clinical Pad */}
            <div className="grid md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[var(--border-subtle)]">
              {/* Left Rail: Patient Vitals & Chief Complaints (5 cols) */}
              <div className="md:col-span-5 p-4 sm:p-5 bg-[var(--bg-app)]/50 space-y-4">
                {/* Patient Identity */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center shrink-0">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {t("uiTariqulIslam")}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {t("uiYMale")}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-[var(--brand-text)] bg-[var(--brand-surface)] px-2 py-0.5 rounded-md border border-[var(--brand-border)] shrink-0">
                    #RX-82910
                  </span>
                </div>

                {/* Vitals 2x2 Precision Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <span className="block text-[10px] font-medium text-[var(--text-muted)]">
                      BP
                    </span>
                    <span className="text-xs font-bold font-mono text-[var(--text-primary)]">
                      120/80 mmHg
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <span className="block text-[10px] font-medium text-[var(--text-muted)]">
                      {t("pulse")}
                    </span>
                    <span className="text-xs font-bold font-mono text-[var(--text-primary)]">
                      74 {t("uiBpm")}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <span className="block text-[10px] font-medium text-[var(--text-muted)]">
                      SpO2
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      99%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <span className="block text-[10px] font-medium text-[var(--text-muted)]">
                      {t("temp")}
                    </span>
                    <span className="text-xs font-bold font-mono text-[var(--text-primary)]">
                      98.4°F
                    </span>
                  </div>
                </div>

                {/* Interactive Chief Complaints Presets */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      {t("chiefComplaints")}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {t.landingInteractivePresets}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {COMPLAINT_PRESETS.map((comp) => {
                      const isSelected = selectedComplaintIds.includes(comp.id);
                      const label = isBn ? comp.bn : comp.en;
                      return (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => toggleComplaint(comp.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer inline-flex items-center gap-1 ${
                            isSelected
                              ? "bg-[var(--brand-surface)] text-[var(--brand-text)] border-[var(--brand-primary)] font-semibold"
                              : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle2 className="w-3 h-3 text-[var(--brand-primary)] shrink-0" />
                          )}
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Pane: Rx Medications & Formulary Quick-Add (7 cols) */}
              <div className="md:col-span-7 p-4 sm:p-5 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-serif italic font-black text-[var(--brand-text)] leading-none">
                        ℞
                      </span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {t("uiPrescribedMedications")}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">
                      {activeMedicines.length} {t.itemsActiveSuffix}
                    </span>
                  </div>

                  {/* Active Medicines List */}
                  <div className="space-y-2">
                    {activeMedicines.map((med) => (
                      <div
                        key={med.id}
                        className="p-2.5 rounded-lg bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)] flex items-center justify-between gap-2 group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <strong className="text-xs font-bold text-[var(--text-primary)] truncate">
                              {med.name}
                            </strong>
                          </div>
                          <span className="text-[11px] text-[var(--text-muted)] truncate block">
                            {med.generic} · {med.timing}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-[11px] font-mono font-bold">
                            {med.dose}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] text-[11px] font-medium">
                            {med.duration}
                          </span>
                          {activeMedicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => toggleMedicine(med.id)}
                              aria-label={`Remove ${med.name}`}
                              className="p-1 rounded-md text-[var(--text-muted)] hover:text-rose-500 hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add from Formulary Strip */}
                  {availableToAdd.length > 0 && (
                    <div className="pt-1 space-y-1.5">
                      <span className="text-[11px] font-medium text-[var(--text-muted)] block">
                        {t.addFromFormularyLabel}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {availableToAdd.map((med) => (
                          <button
                            key={med.id}
                            type="button"
                            onClick={() => toggleMedicine(med.id)}
                            className="px-2.5 py-1 rounded-md border border-dashed border-[var(--brand-primary)]/50 text-[var(--brand-text)] hover:bg-[var(--brand-surface)] transition-colors inline-flex items-center gap-1 cursor-pointer text-[11px] font-semibold"
                          >
                            <Plus className="w-3 h-3" />
                            <span>{med.name.split(" ")[1]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Advice & Verification Bar */}
                <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="text-[var(--text-muted)] truncate max-w-[260px]">
                    {t("uiAdviceCompleteBedRestWarm")}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t("uiDigitallyVerified")}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: WIDESCREEN LIVE WAITING ROOM TV MONITOR             */}
        {/* ========================================================= */}
        {activeTab === "queue" && (
          <div className="p-5 sm:p-6 grid md:grid-cols-12 gap-5 items-stretch">
            {/* Left TV Call Display (7 cols) */}
            <div className="md:col-span-7 p-5 rounded-xl bg-slate-950 text-white border border-slate-800 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono font-semibold text-emerald-400">
                    {t.chamberLiveTickerLabel}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {t.room302Label}
                </span>
              </div>

              <div className="py-4 text-center space-y-1">
                <span className="text-xs font-medium text-slate-400 block">
                  {t.landingNowServing}
                </span>
                <div className="text-6xl font-black font-mono tracking-tight text-white">
                  <span className="text-[var(--brand-primary)]">#</span>
                  {currentToken}
                </div>
                <p className="text-xs text-slate-300 font-medium pt-1">
                  {calledNotice ||
                    `${t("uiDrFahimRahman")} · ${t.opdConsultationSuffix}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">
                    {t.landingNextInLine}
                  </span>
                  <span className="font-mono font-bold text-amber-400 text-base">
                    #{currentToken + 1}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">
                    {t.lobbyStatusLabel}
                  </span>
                  <span className="font-semibold text-slate-200 text-xs inline-flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.landingWaitingCount}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Queue Controls & Upcoming Tokens (5 cols) */}
            <div className="md:col-span-5 flex flex-col justify-between gap-4">
              <div className="p-4 rounded-xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)] space-y-2.5 flex-1">
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  {t.landingNextInLine}
                </span>
                {[1, 2, 3].map((offset) => (
                  <div
                    key={offset}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs"
                  >
                    <span className="font-mono font-bold text-[var(--brand-text)]">
                      #{currentToken + offset}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      ~{offset * 7} min
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-3">
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] block">
                    {t.physicianCallControllerTitle}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
                    {t.physicianCallControllerDesc}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={callNextPatient}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--brand-primary)] hover:opacity-95 text-white text-xs font-semibold transition-opacity cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{t.landingSimulateCall}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: WIDESCREEN PATIENT DIGITAL PASS & REMINDERS         */}
        {/* ========================================================= */}
        {activeTab === "patient" && (
          <div className="p-5 sm:p-6 grid md:grid-cols-12 gap-5 items-stretch">
            {/* Left QR Digital Pass (6 cols) */}
            <div className="md:col-span-6 p-4 rounded-xl bg-[var(--bg-subtle)]/60 border border-[var(--border-subtle)] flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center font-black text-xs">
                    Rx
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight">
                      {t.patientDigitalPassTitle}
                    </h4>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {t.patientDigitalPassSubtitle}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-semibold bg-[var(--bg-surface)] px-2 py-0.5 rounded-md border border-[var(--border-subtle)] text-[var(--brand-text)]">
                  #RX-82910
                </span>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-4">
                <div className="w-20 h-20 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center shrink-0">
                  <QrCode className="w-14 h-14 text-[var(--text-primary)]" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[var(--text-primary)] block">
                    {t.instantPharmacyDispenseTitle}
                  </span>
                  <p className="text-[11px] text-[var(--text-muted)] leading-snug">
                    {t.instantPharmacyDispenseDesc}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  notifyToast(
                    isBn
                      ? "ডিজিটাল প্রেসক্রিপশন ডাউনলোড প্রস্তুত"
                      : "Digital PDF ready for download",
                    "info",
                  )
                }
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--brand-primary)] text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span>{t.pdfDownloadLabel}</span>
              </button>
            </div>

            {/* Right Medication Schedule & Reminder Feed (6 cols) */}
            <div className="md:col-span-6 flex flex-col justify-between gap-3">
              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)] inline-flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t.nextDoseLabel}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    {t.activeAlarmBadge}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)] space-y-1">
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    {t.nextDoseDesc}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{t.autoRemindersNote}</span>
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  {activeMedicines.slice(0, 2).map((med) => (
                    <div
                      key={med.id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border-subtle)] last:border-0"
                    >
                      <span className="font-medium text-[var(--text-primary)] truncate pr-2">
                        {med.name}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-[var(--brand-text)] shrink-0">
                        {med.dose}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-3.5 py-2.5 rounded-lg bg-[var(--brand-surface)] border border-[var(--brand-border)] text-[11px] font-medium text-[var(--brand-text)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{t("uiDigitallyVerified")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Subtle Interactive Hint Strip */}
        <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span>{t.interactivePreviewHint}</span>
          <span className="hidden sm:inline font-mono">
            {t("uiSFastPrescribing")}
          </span>
        </div>
      </div>
    </div>
  );
}
