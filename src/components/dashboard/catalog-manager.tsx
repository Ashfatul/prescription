"use client";

import { useEffect, useState, useTransition } from "react";
import { CustomSelect } from "@/components/common/custom-select";
import { useLanguage } from "@/lib/i18n/language-context";

const inputClasses =
  "w-full px-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]";
const textareaClasses =
  "w-full px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all resize-none";

interface MedicineItem {
  id: string;
  name: string;
  type: string;
  dosage: string;
  instructions?: string | null;
}

interface DiagnosticTestItem {
  id: string;
  name: string;
  instructions?: string | null;
}

interface CatalogManagerProps {
  initialTab?: "medicines" | "tests";
}

export function CatalogManager({ initialTab = "medicines" }: CatalogManagerProps = {}) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"medicines" | "tests">(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);

  if (prevInitialTab !== initialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [tests, setTests] = useState<DiagnosticTestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  // Create/Edit state for medicine
  const [showMedModal, setShowMedModal] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [medName, setMedName] = useState("");
  const [medType, setMedType] = useState("Tablet");
  const [medDosage, setMedDosage] = useState("");
  const [medInstructions, setMedInstructions] = useState("");
  const [medError, setMedError] = useState("");

  // Create/Edit state for test
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [testName, setTestName] = useState("");
  const [testInstructions, setTestInstructions] = useState("");
  const [testError, setTestError] = useState("");

  const refreshCatalog = async () => {
    try {
      const [medRes, testRes] = await Promise.all([
        fetch("/api/medicines"),
        fetch("/api/tests"),
      ]);
      const [medData, testData] = await Promise.all([
        medRes.json(),
        testRes.json(),
      ]);
      if (medData.success) setMedicines(medData.data);
      if (testData.success) setTests(testData.data);
    } catch (e) {
      console.error("Failed to load catalog", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [medRes, testRes] = await Promise.all([
          fetch("/api/medicines"),
          fetch("/api/tests"),
        ]);
        const [medData, testData] = await Promise.all([
          medRes.json(),
          testRes.json(),
        ]);
        if (active && medData.success) setMedicines(medData.data);
        if (active && testData.success) setTests(testData.data);
      } catch (e) {
        console.error("Failed to load catalog", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleOpenAddMed = () => {
    setEditingMedId(null);
    setMedName("");
    setMedType("Tablet");
    setMedDosage("");
    setMedInstructions("");
    setMedError("");
    setShowMedModal(true);
  };

  const handleOpenEditMed = (med: MedicineItem) => {
    setEditingMedId(med.id);
    setMedName(med.name);
    setMedType(med.type);
    setMedDosage(med.dosage);
    setMedInstructions(med.instructions || "");
    setMedError("");
    setShowMedModal(true);
  };

  const handleSaveMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !medDosage.trim()) {
      setMedError("Please fill out name and dosage");
      return;
    }
    setMedError("");

    startTransition(async () => {
      try {
        const url = editingMedId ? `/api/medicines/${editingMedId}` : "/api/medicines";
        const method = editingMedId ? "PATCH" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: medName.trim(),
            type: medType.trim(),
            dosage: medDosage.trim(),
            instructions: medInstructions.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setShowMedModal(false);
          await refreshCatalog();
        } else {
          setMedError(data.error || "Failed to save medicine");
        }
      } catch {
        setMedError("Network error occurred");
      }
    });
  };

  const handleDeleteMed = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/medicines/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMedicines((prev) => prev.filter((m) => m.id !== id));
      } else {
        alert(data.error || "Failed to delete medicine");
      }
    } catch {
      alert("Failed to delete medicine");
    }
  };

  const handleOpenAddTest = () => {
    setEditingTestId(null);
    setTestName("");
    setTestInstructions("");
    setTestError("");
    setShowTestModal(true);
  };

  const handleOpenEditTest = (test: DiagnosticTestItem) => {
    setEditingTestId(test.id);
    setTestName(test.name);
    setTestInstructions(test.instructions || "");
    setTestError("");
    setShowTestModal(true);
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) {
      setTestError("Please enter test name");
      return;
    }
    setTestError("");

    startTransition(async () => {
      try {
        const url = editingTestId ? `/api/tests/${editingTestId}` : "/api/tests";
        const method = editingTestId ? "PATCH" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: testName.trim(),
            instructions: testInstructions.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setShowTestModal(false);
          await refreshCatalog();
        } else {
          setTestError(data.error || "Failed to save test");
        }
      } catch {
        setTestError("Network error occurred");
      }
    });
  };

  const handleDeleteTest = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/tests/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTests((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert(data.error || "Failed to delete test");
      }
    } catch {
      alert("Failed to delete test");
    }
  };

  const medicineTypes = ["ALL", ...Array.from(new Set(medicines.map((m) => m.type)))];

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.dosage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.instructions && m.instructions.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "ALL" || m.type === selectedType;
    return matchesSearch && matchesType;
  });

  const filteredTests = tests.filter((t) => {
    return (
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.instructions && t.instructions.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t.catalogTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.catalogSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="text-center">
              <span className="text-lg font-bold text-slate-900 dark:text-white">{medicines.length}</span>
              <p className="text-[10px] uppercase font-semibold text-slate-400">{t.medications}</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <span className="text-lg font-bold text-slate-900 dark:text-white">{tests.length}</span>
              <p className="text-[10px] uppercase font-semibold text-slate-400">{t.diagnosticLabTests}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={activeTab === "medicines" ? handleOpenAddMed : handleOpenAddTest}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-semibold hover:opacity-90 shadow-sm transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>{activeTab === "medicines" ? t.addMedicineBtn : t.addTestBtn}</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 self-start">
          <button
            type="button"
            onClick={() => setActiveTab("medicines")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "medicines"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>💊 {t.pharmaceuticalDrugs} ({medicines.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tests")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "tests"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>🔬 {t.diagnosticLabTests} ({tests.length})</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeTab === "medicines" ? t.searchMedicinesPlaceholder : t.searchTestsPlaceholder}
              className="w-full input-icon-left !pl-11 pr-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]"
            />
          </div>

          {activeTab === "medicines" && (
            <div className="w-40 shrink-0">
              <CustomSelect
                value={selectedType}
                onChange={(val) => setSelectedType(val)}
                options={medicineTypes.map((tName) => ({
                  value: tName,
                  label: tName === "ALL" ? (t("uiAllForms")) : tName,
                }))}
                searchable={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Catalog Content */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">{t.loading}</div>
      ) : activeTab === "medicines" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedicines.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">{t("uiNoMedicinesFoundMatchingYour")}</p>
            </div>
          ) : (
            filteredMedicines.map((med) => (
              <div
                key={med.id}
                className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 hover:border-[var(--brand-border)] transition-all shadow-xs flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)]">
                      {med.type}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {med.dosage}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    {med.name}
                  </h3>
                  {med.instructions && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      💡 {med.instructions}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleOpenEditMed(med)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[var(--brand-text)] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                  >
                    {t.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMed(med.id, med.name)}
                    className="px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all cursor-pointer"
                  >
                    {t.delete}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTests.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">{t("uiNoDiagnosticTestsFoundMatching")}</p>
            </div>
          ) : (
            filteredTests.map((test) => (
              <div
                key={test.id}
                className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 hover:border-[var(--brand-border)] transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                      {t("uiInvestigation")}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                    {test.name}
                  </h3>
                  {test.instructions && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      📋 {t("uiInstructions")} {test.instructions}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleOpenEditTest(test)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[var(--brand-text)] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                  >
                    {t.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTest(test.id, test.name)}
                    className="px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all cursor-pointer"
                  >
                    {t.delete}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Medicine Modal */}
      {showMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-elevated)] border border-slate-200 dark:border-slate-800 shadow-2xl modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
            <div className="modal-header shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingMedId
                  ? (t("uiEditPharmaceutical"))
                  : (t("uiAddNewPharmaceutical"))}
              </h3>
              <button
                type="button"
                onClick={() => setShowMedModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMed} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="modal-body flex-1 overflow-y-auto p-6 space-y-4">
                {medError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-xs text-red-600">
                    {medError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                      {t.brandName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      placeholder={t("uiEGMaxproNapaExtra")}
                      className={inputClasses}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                      {t.dosageForm}
                    </label>
                    <CustomSelect
                      value={medType}
                      onChange={(val) => setMedType(val)}
                      options={[
                        { value: "Tablet", label: t("typeTablet") },
                        { value: "Capsule", label: t("typeCapsule") },
                        { value: "Syrup", label: t("typeSyrup") },
                        { value: "Suspension", label: t("uiSuspension") },
                        { value: "Injection", label: t("typeInjection") },
                        { value: "Inhaler", label: t("typeInhaler") },
                        { value: "Eye Drops", label: t("uiEyeDrops") },
                        { value: "Ointment", label: t("uiOintment") },
                      ]}
                      searchable={false}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    {t.strengthDosageLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    placeholder="e.g. 20mg, 500mg + 65mg, 100ml"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    {t("uiDefaultIntakeInstructions")}
                  </label>
                  <textarea
                    rows={2}
                    value={medInstructions}
                    onChange={(e) => setMedInstructions(e.target.value)}
                    placeholder={t("uiEGCapsuleMinutesBefore")}
                    className={textareaClasses}
                  />
                </div>
              </div>

              <div className="modal-footer shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setShowMedModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isPending ? t.saving : editingMedId ? (t("uiUpdateMedicine")) : (t("uiSaveToCatalog"))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-elevated)] border border-slate-200 dark:border-slate-800 shadow-2xl modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
            <div className="modal-header shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingTestId
                  ? (t("uiEditDiagnosticTest"))
                  : (t("uiAddNewDiagnosticTest"))}
              </h3>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="modal-body flex-1 overflow-y-auto p-6 space-y-4">
                {testError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-xs text-red-600">
                    {testError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    {t("uiInvestigationName")}
                  </label>
                  <input
                    type="text"
                    required
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g. CBC with ESR, Echocardiogram"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    {t("uiPreparationInstructions")}
                  </label>
                  <textarea
                    rows={2}
                    value={testInstructions}
                    onChange={(e) => setTestInstructions(e.target.value)}
                    placeholder={t("uiEGHoursOvernightFasting")}
                    className={textareaClasses}
                  />
                </div>
              </div>

              <div className="modal-footer shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isPending ? t.saving : editingTestId ? (t("uiUpdateTest")) : (t("uiSaveTest"))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
