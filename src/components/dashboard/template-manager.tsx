"use client";

import { useEffect, useState } from "react";

export type TemplateContent = {
  hospitalName?: string;
  hospitalTagline?: string;
  hospitalAddress?: string;
  hospitalPhone?: string;
  hospitalEmail?: string;
  hospitalWebsite?: string;
  themeColor?: string;
  showVitals?: boolean;
  showClinicalNotes?: boolean;
  disclaimer?: string;
};

export type TemplateItem = {
  id: string;
  name: string;
  isDefault: boolean;
  contentJson: TemplateContent | null;
  createdAt: string;
};

export function TemplateManager() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalTagline, setHospitalTagline] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [hospitalPhone, setHospitalPhone] = useState("");
  const [hospitalEmail, setHospitalEmail] = useState("");
  const [hospitalWebsite, setHospitalWebsite] = useState("");
  const [themeColor, setThemeColor] = useState("#0f766e");
  const [disclaimer, setDisclaimer] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch("/api/templates");
        const data = await res.json();
        if (active && data.success && Array.isArray(data.data)) {
          setTemplates(data.data);
        }
      } catch {
        console.error("Failed to fetch templates");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const refreshTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTemplates(data.data);
      }
    } catch {
      console.error("Failed to refresh templates");
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setName("New Hospital Prescription Template");
    setHospitalName("Metropolitan Specialized Hospital");
    setHospitalTagline("Center of Medical Excellence & Compassionate Care");
    setHospitalAddress("Plot 12, Road 4, Sector 7, Uttara, Dhaka-1230");
    setHospitalPhone("+880 2-8901234 / Emergency: 10678");
    setHospitalEmail("info@metropolitanhospital.com");
    setHospitalWebsite("www.metropolitanhospital.com");
    setThemeColor("#0f766e");
    setDisclaimer(
      "This is a legally valid computer-generated medical prescription. Please keep it safe for follow-up visits. For medical emergencies, call our 24/7 hotline 10678 or visit the nearest emergency room immediately."
    );
    setIsDefault(false);
    setStatusMsg(null);
    setShowCreateModal(true);
  };

  const openEditModal = (tpl: TemplateItem) => {
    setEditingId(tpl.id);
    setName(tpl.name);
    const content = (tpl.contentJson as TemplateContent) || {};
    setHospitalName(content.hospitalName || "");
    setHospitalTagline(content.hospitalTagline || "");
    setHospitalAddress(content.hospitalAddress || "");
    setHospitalPhone(content.hospitalPhone || "");
    setHospitalEmail(content.hospitalEmail || "");
    setHospitalWebsite(content.hospitalWebsite || "");
    setThemeColor(content.themeColor || "#0f766e");
    setDisclaimer(content.disclaimer || "");
    setIsDefault(Boolean(tpl.isDefault));
    setStatusMsg(null);
    setShowCreateModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const payload = {
      name,
      isDefault,
      contentJson: {
        hospitalName,
        hospitalTagline,
        hospitalAddress,
        hospitalPhone,
        hospitalEmail,
        hospitalWebsite,
        themeColor,
        disclaimer,
        showVitals: true,
        showClinicalNotes: true,
      },
    };

    try {
      const url = editingId ? `/api/templates/${editingId}` : "/api/templates";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setSaving(false);

      if (!res.ok || !data.success) {
        setStatusMsg({ type: "error", text: data.message || "Failed to save template." });
        return;
      }

      setStatusMsg({ type: "success", text: "Template saved successfully!" });
      setShowCreateModal(false);
      await refreshTemplates();
    } catch {
      setSaving(false);
      setStatusMsg({ type: "error", text: "Network error saving template." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await fetch(`/api/templates/${id}`, { method: "DELETE" });
      await refreshTemplates();
    } catch {
      console.error("Failed to delete template");
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Hospital Prescription Master Templates
          </h2>
          <p className="text-xs text-slate-500">
            Configure hospital branding, layout styles, and legal disclaimers used across doctor prescriptions.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="rounded-2xl bg-[var(--brand-primary)] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:opacity-90"
        >
          + Create Master Template
        </button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-xs text-slate-400">Loading templates...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((tpl) => {
            const content = (tpl.contentJson as TemplateContent) || {};
            const color = content.themeColor || "#0f766e";

            return (
              <div
                key={tpl.id}
                className="flex flex-col justify-between p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-[var(--bg-app)] transition hover:border-[var(--brand-border)] shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {tpl.name}
                    </span>
                    {tpl.isDefault && (
                      <span className="rounded-full bg-[var(--brand-surface)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-text)] border border-[var(--brand-border)]">
                        Default Template
                      </span>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[var(--bg-surface)] p-4 space-y-1.5 shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full shadow-xs" style={{ backgroundColor: color }} />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {content.hospitalName || "Hospital Name"}
                      </h4>
                    </div>
                    {content.hospitalTagline && (
                      <p className="text-xs text-slate-500 italic">{content.hospitalTagline}</p>
                    )}
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                      📍 {content.hospitalAddress || "Address not set"}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      📞 {content.hospitalPhone || "Phone not set"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-200/60 dark:border-slate-800/60 pt-3">
                  <button
                    onClick={() => openEditModal(tpl)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 shadow-xs"
                  >
                    Edit Template
                  </button>
                  {!tpl.isDefault && (
                    <button
                      onClick={() => handleDelete(tpl.id)}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[var(--bg-elevated)] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingId ? "Edit Main Prescription Template" : "Create Main Prescription Template"}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {statusMsg && (
              <div
                className={`rounded-2xl p-3 text-xs font-medium ${
                  statusMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                    Template Title *
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Modern Hospital Standard"
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] px-3.5 py-2 text-xs focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                    Theme Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded-xl border border-slate-300 dark:border-slate-700 p-1"
                    />
                    <input
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      placeholder="#0f766e"
                      className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] px-3.5 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                  Hospital / Organization Name *
                </label>
                <input
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. Metropolitan Specialized Hospital"
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                  Hospital Tagline / Motto
                </label>
                <input
                  value={hospitalTagline}
                  onChange={(e) => setHospitalTagline(e.target.value)}
                  placeholder="e.g. Center of Medical Excellence & Compassionate Care"
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                    Hospital Address
                  </label>
                  <input
                    value={hospitalAddress}
                    onChange={(e) => setHospitalAddress(e.target.value)}
                    placeholder="Plot 12, Road 4, Sector 7, Dhaka"
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                    Hotline / Phone
                  </label>
                  <input
                    value={hospitalPhone}
                    onChange={(e) => setHospitalPhone(e.target.value)}
                    placeholder="+880 2-8901234 / Emergency 10678"
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                    Email
                  </label>
                  <input
                    value={hospitalEmail}
                    onChange={(e) => setHospitalEmail(e.target.value)}
                    placeholder="contact@hospital.com"
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                    Website
                  </label>
                  <input
                    value={hospitalWebsite}
                    onChange={(e) => setHospitalWebsite(e.target.value)}
                    placeholder="www.hospital.com"
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                  Legal & Emergency Disclaimer
                </label>
                <textarea
                  rows={2}
                  value={disclaimer}
                  onChange={(e) => setDisclaimer(e.target.value)}
                  placeholder="Computer generated prescription disclaimer..."
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="defaultTpl"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                />
                <label htmlFor="defaultTpl" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Set as Default Master Template for Doctors
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-2xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-[var(--brand-primary)] px-5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-90 disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save Master Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
