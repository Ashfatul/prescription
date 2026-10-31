"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/common/card";

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
      "This is a legally valid computer-generated medical prescription. Please keep it safe for follow-up visits. For medical emergencies, call our 24/7 hotline 10678 or visit the nearest emergency room immediately.",
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
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Main Prescription Templates
          </h2>
          <p className="text-xs text-zinc-500">
            Configure hospital branding, layout styles, and legal disclaimers used across doctor prescriptions.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          + Create New Template
        </button>
      </div>

      {loading ? (
        <p className="py-6 text-sm text-zinc-500">Loading templates...</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {templates.map((tpl) => {
            const content = (tpl.contentJson as TemplateContent) || {};
            const color = content.themeColor || "#0f766e";

            return (
              <div
                key={tpl.id}
                className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{tpl.name}</span>
                    {tpl.isDefault && (
                      <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                        Main Default
                      </span>
                    )}
                  </div>

                  <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                        {content.hospitalName || "Hospital Name"}
                      </h4>
                    </div>
                    {content.hospitalTagline && (
                      <p className="mt-0.5 text-xs text-zinc-500 italic">{content.hospitalTagline}</p>
                    )}
                    <p className="mt-1.5 text-[11px] text-zinc-500">
                      📍 {content.hospitalAddress || "Address not set"}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      📞 {content.hospitalPhone || "Phone not set"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-zinc-200/70 pt-3 dark:border-zinc-800/70">
                  <button
                    onClick={() => openEditModal(tpl)}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Edit Template
                  </button>
                  {!tpl.isDefault && (
                    <button
                      onClick={() => handleDelete(tpl.id)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {editingId ? "Edit Main Prescription Template" : "Create Main Prescription Template"}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-sm font-semibold text-zinc-400 hover:text-zinc-600"
              >
                ✕ Close
              </button>
            </div>

            {statusMsg && (
              <div
                className={`mt-4 rounded-xl p-3 text-sm ${
                  statusMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold">Template Title *</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Modern Hospital Standard"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold">Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded-lg border border-zinc-300 p-1 dark:border-zinc-700 dark:bg-zinc-950"
                    />
                    <input
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      placeholder="#0f766e"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Hospital / Organization Name *</label>
                <input
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. Metropolitan Specialized Hospital"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Hospital Tagline / Motto</label>
                <input
                  value={hospitalTagline}
                  onChange={(e) => setHospitalTagline(e.target.value)}
                  placeholder="e.g. Center of Medical Excellence & Compassionate Care"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold">Hospital Address</label>
                  <input
                    value={hospitalAddress}
                    onChange={(e) => setHospitalAddress(e.target.value)}
                    placeholder="Plot 12, Road 4, Sector 7, Dhaka"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold">Hotline / Phone</label>
                  <input
                    value={hospitalPhone}
                    onChange={(e) => setHospitalPhone(e.target.value)}
                    placeholder="+880 2-8901234 / Emergency 10678"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold">Email</label>
                  <input
                    value={hospitalEmail}
                    onChange={(e) => setHospitalEmail(e.target.value)}
                    placeholder="contact@hospital.com"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold">Website</label>
                  <input
                    value={hospitalWebsite}
                    onChange={(e) => setHospitalWebsite(e.target.value)}
                    placeholder="www.hospital.com"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Legal & Emergency Disclaimer</label>
                <textarea
                  rows={2}
                  value={disclaimer}
                  onChange={(e) => setDisclaimer(e.target.value)}
                  placeholder="Computer generated prescription disclaimer..."
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="defaultTpl"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="defaultTpl" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Set as Default Template for Doctors
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
