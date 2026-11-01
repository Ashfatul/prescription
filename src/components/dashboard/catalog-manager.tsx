"use client";

import { useEffect, useState, useTransition } from "react";
import { CustomSelect } from "@/components/common/custom-select";

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
              Clinical Catalog Hub
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Centralized inventory for medicines and lab investigations used across prescriptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="text-center">
              <span className="text-lg font-bold text-slate-900 dark:text-white">{medicines.length}</span>
              <p className="text-[10px] uppercase font-semibold text-slate-400">Medicines</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <span className="text-lg font-bold text-slate-900 dark:text-white">{tests.length}</span>
              <p className="text-[10px] uppercase font-semibold text-slate-400">Lab Tests</p>
            </div>
          </div>

          <button
            type="button"
            onClick={activeTab === "medicines" ? handleOpenAddMed : handleOpenAddTest}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-semibold hover:opacity-90 shadow-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>{activeTab === "medicines" ? "Add Medicine" : "Add Lab Test"}</span>
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "medicines"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>💊 Pharmaceuticals ({medicines.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tests")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "tests"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>🔬 Diagnostic Tests ({tests.length})</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-3 h-4 w-4 text-slate-400"
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
              placeholder={activeTab === "medicines" ? "Search by brand, strength, or use..." : "Search tests or preparation instructions..."}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[var(--bg-surface)] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          {activeTab === "medicines" && (
            <div className="w-40 shrink-0">
              <CustomSelect
                value={selectedType}
                onChange={(val) => setSelectedType(val)}
                options={medicineTypes.map((t) => ({
                  value: t,
                  label: t === "ALL" ? "All Forms" : t,
                }))}
                searchable={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Catalog Content */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading catalog items...</div>
      ) : activeTab === "medicines" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedicines.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">No medicines found matching your criteria.</p>
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
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[var(--brand-text)] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMed(med.id, med.name)}
                    className="px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                  >
                    Delete
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
              <p className="text-sm text-slate-500">No diagnostic tests found matching your criteria.</p>
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
                      Investigation
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                    {test.name}
                  </h3>
                  {test.instructions && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      📋 Instructions: {test.instructions}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleOpenEditTest(test)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[var(--brand-text)] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTest(test.id, test.name)}
                    className="px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                  >
                    Delete
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
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[var(--bg-elevated)] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingMedId ? "Edit Pharmaceutical" : "Add New Pharmaceutical"}
              </h3>
              <button
                type="button"
                onClick={() => setShowMedModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {medError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-xs text-red-600">
                {medError}
              </div>
            )}

            <form onSubmit={handleSaveMed} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="e.g. Maxpro, Napa Extra"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] text-sm focus:border-[var(--brand-primary)] focus:outline-none"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Formulation Type
                  </label>
                  <CustomSelect
                    value={medType}
                    onChange={(val) => setMedType(val)}
                    options={[
                      { value: "Tablet", label: "Tablet" },
                      { value: "Capsule", label: "Capsule" },
                      { value: "Syrup", label: "Syrup" },
                      { value: "Suspension", label: "Suspension" },
                      { value: "Injection", label: "Injection" },
                      { value: "Inhaler", label: "Inhaler" },
                      { value: "Eye Drops", label: "Eye Drops" },
                      { value: "Ointment", label: "Ointment" },
                    ]}
                    searchable={false}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Strength / Dosage *
                </label>
                <input
                  type="text"
                  required
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  placeholder="e.g. 20mg, 500mg + 65mg, 100ml"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] text-sm focus:border-[var(--brand-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Default Intake Instructions
                </label>
                <textarea
                  rows={2}
                  value={medInstructions}
                  onChange={(e) => setMedInstructions(e.target.value)}
                  placeholder="e.g. 1 capsule 30 minutes before breakfast & dinner"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] text-xs focus:border-[var(--brand-primary)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMedModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? "Saving..." : editingMedId ? "Update Medicine" : "Save to Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[var(--bg-elevated)] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingTestId ? "Edit Diagnostic Test" : "Add New Diagnostic Test"}
              </h3>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {testError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-xs text-red-600">
                {testError}
              </div>
            )}

            <form onSubmit={handleSaveTest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Investigation Name *
                </label>
                <input
                  type="text"
                  required
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g. CBC with ESR, Echocardiogram"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] text-sm focus:border-[var(--brand-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Preparation Instructions
                </label>
                <textarea
                  rows={2}
                  value={testInstructions}
                  onChange={(e) => setTestInstructions(e.target.value)}
                  placeholder="e.g. 10-12 hours overnight fasting mandatory, clean catch mid-stream urine"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] text-xs focus:border-[var(--brand-primary)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? "Saving..." : editingTestId ? "Update Test" : "Save Test"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
