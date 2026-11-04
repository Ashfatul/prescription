"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Upload,
  Trash2,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
  Eye,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { notifyToast } from "@/lib/toast";

export interface CustomTextBlock {
  id: string;
  text: string;
  x: number; // percentage from left (0 to 100)
  y: number; // percentage from top (0 to 100)
  fontSize: number; // in px
  color: string;
  isBold?: boolean;
}

export interface TemplateContent {
  hospitalName?: string;
  hospitalTagline?: string;
  hospitalAddress?: string;
  hospitalPhone?: string;
  hospitalEmail?: string;
  hospitalWebsite?: string;
  logoUrl?: string;

  // Behind Logo / Watermark
  watermarkUrl?: string;
  watermarkOpacity?: number;
  watermarkSize?: number;
  watermarkX?: number;
  watermarkY?: number;
  showWatermark?: boolean;

  // Colors
  themeColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headerBgColor?: string;

  // Font Sizes
  hospitalTitleSize?: number;
  doctorTitleSize?: number;
  bodyFontSize?: number;
  rxItemFontSize?: number;
  disclaimerFontSize?: number;

  // Positioning
  headerOffsetY?: number;
  signatureOffsetY?: number;
  contentPaddingX?: number;

  // Visibility Toggles
  showHospitalLogo?: boolean;
  showHospitalTagline?: boolean;
  showHospitalContactBar?: boolean;
  showVitals?: boolean;
  showClinicalNotes?: boolean;
  showDiagnosis?: boolean;
  showSignatureBlock?: boolean;
  showDisclaimer?: boolean;
  disclaimer?: string;

  // Floating text blocks
  customTextBlocks?: CustomTextBlock[];
}

export interface TemplateItem {
  id: string;
  name: string;
  isDefault: boolean;
  contentJson: TemplateContent | null;
  createdAt: string;
}

const DEFAULT_WATERMARK_PRESETS = [
  {
    name: "Medical Caduceus",
    url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Hospital Emblem",
    url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Rx Pharmacy Cross",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
  },
];

export function TemplateManager() {
  const { t, language } = useLanguage();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDesigner, setShowDesigner] = useState(false);
  const [activeDesignerTab, setActiveDesignerTab] = useState<
    "branding" | "watermark" | "colors" | "fonts" | "positions" | "visibility" | "customText"
  >("watermark");

  // Template Form State
  const [name, setName] = useState("Hospital Master Prescription Template");
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Content State
  const [hospitalName, setHospitalName] = useState("CareFlow");
  const [hospitalTagline, setHospitalTagline] = useState("Center of Medical Excellence & Compassionate Care");
  const [hospitalAddress, setHospitalAddress] = useState("Plot 12, Road 4, Sector 7, Uttara, Dhaka-1230");
  const [hospitalPhone, setHospitalPhone] = useState("+880 2-8901234 / Hotline: 10678");
  const [hospitalEmail, setHospitalEmail] = useState("info@metropolitanhospital.com");
  const [hospitalWebsite, setHospitalWebsite] = useState("www.metropolitanhospital.com");
  const [logoUrl, setLogoUrl] = useState("");

  // Upload & Responsive State
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [isUploadingWatermark, setIsUploadingWatermark] = useState(false);
  const [watermarkUploadError, setWatermarkUploadError] = useState<string | null>(null);
  const [mobileViewMode, setMobileViewMode] = useState<"controls" | "preview">("controls");
  const [zoom, setZoom] = useState(100);

  // Watermark (Behind Logo)
  const [watermarkUrl, setWatermarkUrl] = useState(DEFAULT_WATERMARK_PRESETS[0].url);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.12);
  const [watermarkSize, setWatermarkSize] = useState(260);
  const [watermarkX, setWatermarkX] = useState(0);
  const [watermarkY, setWatermarkY] = useState(0);
  const [showWatermark, setShowWatermark] = useState(true);

  // Colors
  const [themeColor, setThemeColor] = useState("#0f766e");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#0f172a");
  const [headerBgColor, setHeaderBgColor] = useState("#ffffff");

  // Font Sizes
  const [hospitalTitleSize, setHospitalTitleSize] = useState(22);
  const [doctorTitleSize, setDoctorTitleSize] = useState(17);
  const [bodyFontSize, setBodyFontSize] = useState(12);
  const [rxItemFontSize, setRxItemFontSize] = useState(13);
  const [disclaimerFontSize, setDisclaimerFontSize] = useState(10);

  // Positions & Offsets
  const [headerOffsetY, setHeaderOffsetY] = useState(0);
  const [signatureOffsetY, setSignatureOffsetY] = useState(0);
  const [contentPaddingX, setContentPaddingX] = useState(32);

  // Visibility Toggles
  const [showHospitalLogo, setShowHospitalLogo] = useState(true);
  const [showHospitalTagline, setShowHospitalTagline] = useState(true);
  const [showHospitalContactBar, setShowHospitalContactBar] = useState(true);
  const [showVitals, setShowVitals] = useState(true);
  const [showClinicalNotes, setShowClinicalNotes] = useState(true);
  const [showDiagnosis, setShowDiagnosis] = useState(true);
  const [showSignatureBlock, setShowSignatureBlock] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [disclaimer, setDisclaimer] = useState(
    "This is a legally verified computer-generated medical prescription. Please keep safe for follow-up review. For medical emergencies, dial 10678 immediately."
  );

  // Custom Floating Text Blocks ("Place text anywhere")
  const [customTextBlocks, setCustomTextBlocks] = useState<CustomTextBlock[]>([
    {
      id: "demo-badge-1",
      text: "CERTIFIED CLINICAL DOCUMENT",
      x: 72,
      y: 92,
      fontSize: 9,
      color: "#0f766e",
      isBold: true,
    },
  ]);

  const loadTemplates = useCallback(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTemplates(data.data);
        }
      })
      .catch(() => {
        console.error("Failed to fetch templates");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoUploadError("Please select a valid image file (PNG, JPG, SVG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLogoUploadError("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") {
        setLogoUrl(ev.target.result);
      }
    };
    reader.readAsDataURL(file);

    setIsUploadingLogo(true);
    setLogoUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to upload logo");
      }

      setLogoUrl(data.data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload logo image";
      setLogoUploadError(msg);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleUploadWatermark = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setWatermarkUploadError("Please select a valid image file (PNG, JPG, SVG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setWatermarkUploadError("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") {
        setWatermarkUrl(ev.target.result);
      }
    };
    reader.readAsDataURL(file);

    setIsUploadingWatermark(true);
    setWatermarkUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to upload watermark image");
      }

      setWatermarkUrl(data.data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload watermark image";
      setWatermarkUploadError(msg);
    } finally {
      setIsUploadingWatermark(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setName("Hospital Master Prescription Template");
    setIsDefault(false);
    setHospitalName("CareFlow");
    setHospitalTagline("Center of Medical Excellence & Compassionate Care");
    setHospitalAddress("Plot 12, Road 4, Sector 7, Uttara, Dhaka-1230");
    setHospitalPhone("+880 2-8901234 / Hotline: 10678");
    setHospitalEmail("info@metropolitanhospital.com");
    setHospitalWebsite("www.metropolitanhospital.com");
    setLogoUrl("");
    setWatermarkUrl(DEFAULT_WATERMARK_PRESETS[0].url);
    setWatermarkOpacity(0.12);
    setWatermarkSize(260);
    setWatermarkX(0);
    setWatermarkY(0);
    setShowWatermark(true);
    setThemeColor("#0f766e");
    setBackgroundColor("#ffffff");
    setTextColor("#0f172a");
    setHeaderBgColor("#ffffff");
    setHospitalTitleSize(22);
    setDoctorTitleSize(17);
    setBodyFontSize(12);
    setRxItemFontSize(13);
    setDisclaimerFontSize(10);
    setHeaderOffsetY(0);
    setSignatureOffsetY(0);
    setContentPaddingX(32);
    setShowHospitalLogo(true);
    setShowHospitalTagline(true);
    setShowHospitalContactBar(true);
    setShowVitals(true);
    setShowClinicalNotes(true);
    setShowDiagnosis(true);
    setShowSignatureBlock(true);
    setShowDisclaimer(true);
    setCustomTextBlocks([
      {
        id: "badge-1",
        text: "CERTIFIED CLINICAL DOCUMENT",
        x: 72,
        y: 92,
        fontSize: 9,
        color: "#0f766e",
        isBold: true,
      },
    ]);
    setStatusMsg(null);
    setLogoUploadError(null);
    setWatermarkUploadError(null);
    setMobileViewMode("controls");
    setZoom(100);
    setShowDesigner(true);
  };

  const openEditModal = (tpl: TemplateItem) => {
    setEditingId(tpl.id);
    setName(tpl.name);
    setIsDefault(Boolean(tpl.isDefault));
    const c = (tpl.contentJson as TemplateContent) || {};
    setHospitalName(c.hospitalName || "CareFlow");
    setHospitalTagline(c.hospitalTagline || "Center of Medical Excellence & Compassionate Care");
    setHospitalAddress(c.hospitalAddress || "Plot 12, Road 4, Sector 7, Uttara, Dhaka-1230");
    setHospitalPhone(c.hospitalPhone || "+880 2-8901234 / Hotline: 10678");
    setHospitalEmail(c.hospitalEmail || "info@metropolitanhospital.com");
    setHospitalWebsite(c.hospitalWebsite || "www.metropolitanhospital.com");
    setLogoUrl(c.logoUrl || "");
    setWatermarkUrl(c.watermarkUrl || DEFAULT_WATERMARK_PRESETS[0].url);
    setWatermarkOpacity(c.watermarkOpacity ?? 0.12);
    setWatermarkSize(c.watermarkSize ?? 260);
    setWatermarkX(c.watermarkX ?? 0);
    setWatermarkY(c.watermarkY ?? 0);
    setShowWatermark(c.showWatermark ?? true);
    setThemeColor(c.themeColor || "#0f766e");
    setBackgroundColor(c.backgroundColor || "#ffffff");
    setTextColor(c.textColor || "#0f172a");
    setHeaderBgColor(c.headerBgColor || "#ffffff");
    setHospitalTitleSize(c.hospitalTitleSize ?? 22);
    setDoctorTitleSize(c.doctorTitleSize ?? 17);
    setBodyFontSize(c.bodyFontSize ?? 12);
    setRxItemFontSize(c.rxItemFontSize ?? 13);
    setDisclaimerFontSize(c.disclaimerFontSize ?? 10);
    setHeaderOffsetY(c.headerOffsetY ?? 0);
    setSignatureOffsetY(c.signatureOffsetY ?? 0);
    setContentPaddingX(c.contentPaddingX ?? 32);
    setShowHospitalLogo(c.showHospitalLogo ?? true);
    setShowHospitalTagline(c.showHospitalTagline ?? true);
    setShowHospitalContactBar(c.showHospitalContactBar ?? true);
    setShowVitals(c.showVitals ?? true);
    setShowClinicalNotes(c.showClinicalNotes ?? true);
    setShowDiagnosis(c.showDiagnosis ?? true);
    setShowSignatureBlock(c.showSignatureBlock ?? true);
    setShowDisclaimer(c.showDisclaimer ?? true);
    setDisclaimer(
      c.disclaimer ||
        "This is a legally verified computer-generated medical prescription. Please keep safe for follow-up review. For medical emergencies, dial 10678 immediately."
    );
    setCustomTextBlocks(c.customTextBlocks || []);
    setStatusMsg(null);
    setLogoUploadError(null);
    setWatermarkUploadError(null);
    setMobileViewMode("controls");
    setZoom(100);
    setShowDesigner(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const payloadContent: TemplateContent = {
      hospitalName,
      hospitalTagline,
      hospitalAddress,
      hospitalPhone,
      hospitalEmail,
      hospitalWebsite,
      logoUrl: logoUrl.trim() || undefined,
      watermarkUrl: watermarkUrl.trim() || undefined,
      watermarkOpacity,
      watermarkSize,
      watermarkX,
      watermarkY,
      showWatermark,
      themeColor,
      backgroundColor,
      textColor,
      headerBgColor,
      hospitalTitleSize,
      doctorTitleSize,
      bodyFontSize,
      rxItemFontSize,
      disclaimerFontSize,
      headerOffsetY,
      signatureOffsetY,
      contentPaddingX,
      showHospitalLogo,
      showHospitalTagline,
      showHospitalContactBar,
      showVitals,
      showClinicalNotes,
      showDiagnosis,
      showSignatureBlock,
      showDisclaimer,
      disclaimer,
      customTextBlocks,
    };

    try {
      const url = editingId ? `/api/templates/${editingId}` : "/api/templates";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          isDefault,
          contentJson: payloadContent,
        }),
      });

      const data = await res.json();
      setSaving(false);

      if (!res.ok || !data.success) {
        const message = data.message || "Failed to save template.";
        setStatusMsg({ type: "error", text: message });
        notifyToast(message, "error");
        return;
      }

      setStatusMsg({ type: "success", text: "Master template saved successfully!" });
      notifyToast("Master template saved successfully!", "success");
      setShowDesigner(false);
      await loadTemplates();
    } catch {
      setSaving(false);
      setStatusMsg({ type: "error", text: "Network error occurred." });
    }
  };

  const handleDelete = async (id: string, tplName: string) => {
    if (!confirm(`Are you sure you want to delete template "${tplName}"?`)) return;
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        notifyToast("Template deleted successfully.", "success");
      } else {
        notifyToast(data.message || "Failed to delete template", "error");
      }
    } catch {
      notifyToast("Failed to delete template", "error");
    }
  };

  const handleAddCustomText = () => {
    const newBlock: CustomTextBlock = {
      id: "text-" + Date.now(),
      text: "CLINICAL AUDIT STAMP",
      x: 50,
      y: 50,
      fontSize: 11,
      color: themeColor,
      isBold: true,
    };
    setCustomTextBlocks((prev) => [...prev, newBlock]);
  };

  const handleUpdateCustomText = (id: string, updates: Partial<CustomTextBlock>) => {
    setCustomTextBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const handleRemoveCustomText = (id: string) => {
    setCustomTextBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 text-xs font-bold">
              Visual Prescription Designer
            </span>
            <span className="text-xs text-slate-400 font-medium">• Master Templates</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hospital Pad & Template Architect
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Craft beautiful A4 prescription layouts with live interactive preview, background watermarks, custom X/Y positioning, colors, and font controls.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer self-start md:self-auto shrink-0"
        >
          <span>✨</span>
          <span>{t("uiCreateMasterTemplate")}</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold border ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400">
            {t("uiLoadingPrescriptionTemplates")}
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400">
            {t("uiNoTemplatesConfiguredYetClick")}
          </div>
        ) : (
          templates.map((tpl) => {
            const content = (tpl.contentJson as TemplateContent) || {};
            const cardTheme = content.themeColor || "#0f766e";
            return (
              <div
                key={tpl.id}
                className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {content.logoUrl ? (
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={content.logoUrl}
                            alt="Logo"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: cardTheme }}
                        />
                      )}
                    </div>
                    {tpl.isDefault ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200">
                        {t("uiDefaultMaster")}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {t("uiChamberLayout")}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {tpl.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 truncate">
                    {content.hospitalName || "Hospital"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {content.hospitalAddress || "Address"}
                  </p>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {content.showWatermark && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        🖼️ Behind Watermark
                      </span>
                    )}
                    {content.customTextBlocks && content.customTextBlocks.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        ✍️ {content.customTextBlocks.length} Custom Text
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      🎨 {cardTheme}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {new Date(tpl.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(tpl)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      🎨 Customize
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tpl.id, tpl.name)}
                      className="px-2.5 py-1.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FULLSCREEN INTERACTIVE DESIGNER MODAL */}
      {showDesigner && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-sm">
          {/* Top Navbar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[var(--bg-surface)] border-b border-slate-200 dark:border-slate-800 shrink-0 gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <span className="w-8 h-8 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center font-bold text-sm shrink-0">
                Rx
              </span>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                  {editingId ? "Customize Master Template" : "New Interactive Template"}
                </h3>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Visual A4 Prescription Pad Layout Engine
                </p>
              </div>
            </div>

            {/* Mobile View Toggle (Controls vs Live Preview) */}
            <div className="flex lg:hidden items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
              <button
                type="button"
                onClick={() => setMobileViewMode("controls")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  mobileViewMode === "controls"
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{t("uiControls")}</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileViewMode("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  mobileViewMode === "preview"
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{t.preview}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowDesigner(false)}
                className="px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 sm:px-6 py-2 rounded-xl text-xs font-bold bg-[var(--brand-primary)] text-white shadow-md hover:opacity-90 disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {saving ? t.saving : t.saveTemplate}
              </button>
            </div>
          </div>

          {/* Split Workspace */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100 dark:bg-slate-950">
            {/* Left Column: Interactive Controls */}
            <div
              className={`w-full lg:w-[480px] bg-[var(--bg-surface)] border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shrink-0 ${
                mobileViewMode === "controls" ? "flex flex-1" : "hidden lg:flex"
              }`}
            >
              {/* Category Tab Selector */}
              <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs shrink-0">
                {[
                  { id: "branding", label: `🏥 ${t.brandingInsignia}` },
                  { id: "watermark", label: `🖼️ ${t.watermarkBehindLogo}` },
                  { id: "colors", label: `🎨 ${t.colorPalette}` },
                  { id: "fonts", label: `📐 ${t.typographyScaling}` },
                  { id: "positions", label: `🎯 ${t.offsetsMargins}` },
                  { id: "visibility", label: `👁️ ${t.visibleSections}` },
                  { id: "customText", label: `✍️ ${t.freeFloatingText}` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveDesignerTab(tab.id as typeof activeDesignerTab)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                      activeDesignerTab === tab.id
                        ? "bg-[var(--brand-primary)] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Controls Scrollable Body */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
                {/* 1. Branding & Hospital Details */}
                {activeDesignerTab === "branding" && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Template Label / Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1 pb-1">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="w-4 h-4 rounded text-[var(--brand-primary)]"
                      />
                      <label htmlFor="isDefault" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        Set as Default Master Template for Doctors
                      </label>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Hospital / Healthcare Network Name
                      </label>
                      <input
                        type="text"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tagline / Accreditation
                      </label>
                      <input
                        type="text"
                        value={hospitalTagline}
                        onChange={(e) => setHospitalTagline(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Hospital Address
                      </label>
                      <input
                        type="text"
                        value={hospitalAddress}
                        onChange={(e) => setHospitalAddress(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Phone / Hotline
                        </label>
                        <input
                          type="text"
                          value={hospitalPhone}
                          onChange={(e) => setHospitalPhone(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Official Email
                        </label>
                        <input
                          type="text"
                          value={hospitalEmail}
                          onChange={(e) => setHospitalEmail(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Hospital Web Portal URL
                      </label>
                      <input
                        type="text"
                        value={hospitalWebsite}
                        onChange={(e) => setHospitalWebsite(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700 dark:text-slate-300">
                          Hospital Logo (Header)
                        </label>
                        {logoUrl && (
                          <button
                            type="button"
                            onClick={() => setLogoUrl("")}
                            className="text-red-500 hover:text-red-600 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </button>
                        )}
                      </div>

                      {logoUploadError && (
                        <div className="mb-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{logoUploadError}</span>
                        </div>
                      )}

                      {logoUrl ? (
                        <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-3">
                          <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-xs">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={logoUrl}
                              alt="Hospital Logo Preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                              Hospital Logo Active
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {logoUrl.startsWith("data:") ? "Uploading image..." : logoUrl}
                            </p>
                            <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold cursor-pointer transition shadow-xs">
                              <Upload className="w-3 h-3" />
                              <span>{isUploadingLogo ? "Uploading..." : "Change Logo"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleUploadLogo}
                                disabled={isUploadingLogo}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[var(--brand-primary)] dark:hover:border-[var(--brand-primary)] bg-slate-50/50 dark:bg-slate-900/50 hover:bg-[var(--brand-surface)] transition cursor-pointer text-center group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadLogo}
                            disabled={isUploadingLogo}
                            className="hidden"
                          />
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-[var(--brand-surface)] group-hover:text-[var(--brand-primary)] flex items-center justify-center text-slate-400 mb-2 transition">
                            <Upload className="w-5 h-5" />
                          </div>
                          <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                            {isUploadingLogo ? "Uploading Logo Image..." : "Click or Drag & Drop Hospital Logo"}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            PNG, JPG, SVG, WebP up to 5MB
                          </p>
                        </label>
                      )}

                      {/* Direct URL input fallback */}
                      <div className="mt-2">
                        <details className="text-[11px] text-slate-500">
                          <summary className="cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                            Or enter an image URL directly
                          </summary>
                          <input
                            type="text"
                            placeholder="https://... logo image URL"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            className="w-full mt-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                        </details>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Behind Logo / Watermark Controls */}
                {activeDesignerTab === "watermark" && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-[var(--brand-surface)] border border-[var(--brand-border)]">
                      <div className="flex items-center justify-between">
                        <label htmlFor="showWatermark" className="font-bold text-[var(--brand-text)] cursor-pointer text-xs">
                          Enable Background Watermark (Behind Logo)
                        </label>
                        <input
                          type="checkbox"
                          id="showWatermark"
                          checked={showWatermark}
                          onChange={(e) => setShowWatermark(e.target.checked)}
                          className="w-4 h-4 rounded text-[var(--brand-primary)] cursor-pointer"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Places a watermark insignia directly behind the medical content on every page.
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700 dark:text-slate-300">
                          Behind Logo (Watermark Insignia)
                        </label>
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold cursor-pointer transition shadow-xs">
                          <Upload className="w-3 h-3" />
                          <span>{isUploadingWatermark ? "Uploading..." : "Upload Custom"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadWatermark}
                            disabled={isUploadingWatermark}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {watermarkUploadError && (
                        <div className="mb-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{watermarkUploadError}</span>
                        </div>
                      )}

                      <input
                        type="text"
                        value={watermarkUrl}
                        onChange={(e) => setWatermarkUrl(e.target.value)}
                        placeholder="https://... watermark insignia image URL"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Presets */}
                    <div>
                      <label className="block font-semibold text-slate-500 text-[11px] uppercase tracking-wider mb-1.5">
                        Clinical Emblem Presets
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {DEFAULT_WATERMARK_PRESETS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => setWatermarkUrl(p.url)}
                            className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                              watermarkUrl === p.url
                                ? "border-[var(--brand-primary)] bg-[var(--brand-surface)] font-bold text-[var(--brand-text)]"
                                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Opacity Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          Watermark Opacity: {Math.round(watermarkOpacity * 100)}%
                        </label>
                        <span className="text-slate-400 text-[11px]">Recommended: 8% - 15%</span>
                      </div>
                      <input
                        type="range"
                        min="0.02"
                        max="0.45"
                        step="0.01"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                        className="w-full cursor-pointer accent-[var(--brand-primary)]"
                      />
                    </div>

                    {/* Size Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          Watermark Diameter: {watermarkSize}px
                        </label>
                      </div>
                      <input
                        type="range"
                        min="140"
                        max="520"
                        step="10"
                        value={watermarkSize}
                        onChange={(e) => setWatermarkSize(parseInt(e.target.value))}
                        className="w-full cursor-pointer accent-[var(--brand-primary)]"
                      />
                    </div>

                    {/* Position Sliders */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Offset X: {watermarkX}px
                        </label>
                        <input
                          type="range"
                          min="-200"
                          max="200"
                          step="5"
                          value={watermarkX}
                          onChange={(e) => setWatermarkX(parseInt(e.target.value))}
                          className="w-full cursor-pointer accent-[var(--brand-primary)]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Offset Y: {watermarkY}px
                        </label>
                        <input
                          type="range"
                          min="-200"
                          max="200"
                          step="5"
                          value={watermarkY}
                          onChange={(e) => setWatermarkY(parseInt(e.target.value))}
                          className="w-full cursor-pointer accent-[var(--brand-primary)]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Colors & Background */}
                {activeDesignerTab === "colors" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Brand Accent & Divider Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeColor}
                          onChange={(e) => setThemeColor(e.target.value)}
                          className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={themeColor}
                          onChange={(e) => setThemeColor(e.target.value)}
                          className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                        />
                      </div>
                      {/* Presets */}
                      <div className="flex gap-1.5 mt-2">
                        {["#0f766e", "#2563eb", "#4f46e5", "#e11d48", "#0891b2", "#1e293b"].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setThemeColor(c)}
                            className="w-6 h-6 rounded-lg border border-slate-300 shadow-2xs cursor-pointer"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Prescription Canvas Background Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Primary Text Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Header Banner Tint
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={headerBgColor}
                          onChange={(e) => setHeaderBgColor(e.target.value)}
                          className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={headerBgColor}
                          onChange={(e) => setHeaderBgColor(e.target.value)}
                          className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Font Size Management */}
                {activeDesignerTab === "fonts" && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          Hospital Brand Title: {hospitalTitleSize}px
                        </label>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="34"
                        value={hospitalTitleSize}
                        onChange={(e) => setHospitalTitleSize(parseInt(e.target.value))}
                        className="w-full cursor-pointer accent-[var(--brand-primary)]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          Doctor Name Title: {doctorTitleSize}px
                        </label>
                      </div>
                      <input
                        type="range"
                        min="13"
                        max="26"
                        value={doctorTitleSize}
                        onChange={(e) => setDoctorTitleSize(parseInt(e.target.value))}
                        className="w-full cursor-pointer accent-[var(--brand-primary)]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          Body & Diagnosis Text: {bodyFontSize}px
                        </label>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="16"
                        value={bodyFontSize}
                        onChange={(e) => setBodyFontSize(parseInt(e.target.value))}
                        className="w-full cursor-pointer accent-[var(--brand-primary)]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          Prescribed Medicine Rows: {rxItemFontSize}px
                        </label>
                      </div>
                      <input
                        type="range"
                        min="11"
                        max="18"
                        value={rxItemFontSize}
                        onChange={(e) => setRxItemFontSize(parseInt(e.target.value))}
                        className="w-full cursor-pointer accent-[var(--brand-primary)]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          Legal Disclaimer: {disclaimerFontSize}px
                        </label>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="13"
                        value={disclaimerFontSize}
                        onChange={(e) => setDisclaimerFontSize(parseInt(e.target.value))}
                        className="w-full cursor-pointer accent-[var(--brand-primary)]"
                      />
                    </div>
                  </div>
                )}

                {/* 5. Positions & Offsets */}
                {activeDesignerTab === "positions" && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          Header Top Offset (Y): {headerOffsetY}px
                        </label>
                      </div>
                      <input
                        type="range"
                        min="-20"
                        max="40"
                        value={headerOffsetY}
                        onChange={(e) => setHeaderOffsetY(parseInt(e.target.value))}
                        className="w-full cursor-pointer accent-[var(--brand-primary)]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          Signature Block Offset (Y): {signatureOffsetY}px
                        </label>
                      </div>
                      <input
                        type="range"
                        min="-30"
                        max="50"
                        value={signatureOffsetY}
                        onChange={(e) => setSignatureOffsetY(parseInt(e.target.value))}
                        className="w-full cursor-pointer accent-[var(--brand-primary)]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          Canvas Horizontal Margin: {contentPaddingX}px
                        </label>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="56"
                        value={contentPaddingX}
                        onChange={(e) => setContentPaddingX(parseInt(e.target.value))}
                        className="w-full cursor-pointer accent-[var(--brand-primary)]"
                      />
                    </div>
                  </div>
                )}

                {/* 6. Visibility Toggles (What to Show / Hide) */}
                {activeDesignerTab === "visibility" && (
                  <div className="space-y-2.5">
                    <p className="text-[11px] text-slate-500 mb-2">
                      Toggle which sections to display or conceal on the printed medical sheet:
                    </p>

                    {[
                      { id: "logo", label: "Hospital Header Logo", val: showHospitalLogo, set: setShowHospitalLogo },
                      { id: "tagline", label: "Hospital Vision / Tagline", val: showHospitalTagline, set: setShowHospitalTagline },
                      { id: "contact", label: "Hospital Contact & Phone Bar", val: showHospitalContactBar, set: setShowHospitalContactBar },
                      { id: "watermarkToggle", label: "Behind Logo Watermark", val: showWatermark, set: setShowWatermark },
                      { id: "vitals", label: "Patient Vitals Box (BP, Pulse, Weight)", val: showVitals, set: setShowVitals },
                      { id: "notes", label: "Clinical Complaints & History", val: showClinicalNotes, set: setShowClinicalNotes },
                      { id: "diagnosis", label: "Primary Diagnosis Section", val: showDiagnosis, set: setShowDiagnosis },
                      { id: "sig", label: "Physician Signature & Stamp Block", val: showSignatureBlock, set: setShowSignatureBlock },
                      { id: "disc", label: "Footer Disclaimer Bar", val: showDisclaimer, set: setShowDisclaimer },
                    ].map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                      >
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {item.label}
                        </span>
                        <input
                          type="checkbox"
                          checked={item.val}
                          onChange={(e) => item.set(e.target.checked)}
                          className="w-4 h-4 rounded text-[var(--brand-primary)]"
                        />
                      </label>
                    ))}

                    <div className="pt-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Custom Disclaimer Text
                      </label>
                      <textarea
                        rows={3}
                        value={disclaimer}
                        onChange={(e) => setDisclaimer(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* 7. Custom Floating Text ("Place Text Anywhere") */}
                {activeDesignerTab === "customText" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-slate-500">
                        Add freeform floating stamps, badges, or annotations anywhere on the sheet:
                      </p>
                      <button
                        type="button"
                        onClick={handleAddCustomText}
                        className="px-3 py-1.5 rounded-xl bg-[var(--brand-primary)] text-white text-[11px] font-bold shadow-xs cursor-pointer"
                      >
                        ➕ Add Text Block
                      </button>
                    </div>

                    {customTextBlocks.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                        No custom text blocks yet. Click &quot;Add Text Block&quot; to place custom text anywhere!
                      </div>
                    ) : (
                      customTextBlocks.map((block, idx) => (
                        <div
                          key={block.id}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                              Floating Text #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomText(block.id)}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              ✕ Remove
                            </button>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={block.text}
                              onChange={(e) => handleUpdateCustomText(block.id, { text: e.target.value })}
                              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-slate-400">Position X ({block.x}%)</label>
                              <input
                                type="range"
                                min="0"
                                max="90"
                                value={block.x}
                                onChange={(e) => handleUpdateCustomText(block.id, { x: parseInt(e.target.value) })}
                                className="w-full cursor-pointer accent-[var(--brand-primary)]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400">Position Y ({block.y}%)</label>
                              <input
                                type="range"
                                min="0"
                                max="95"
                                value={block.y}
                                onChange={(e) => handleUpdateCustomText(block.id, { y: parseInt(e.target.value) })}
                                className="w-full cursor-pointer accent-[var(--brand-primary)]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400">
                                {t("uiFont")}
                              </span>
                              <input
                                type="number"
                                min="8"
                                max="28"
                                value={block.fontSize}
                                onChange={(e) => handleUpdateCustomText(block.id, { fontSize: parseInt(e.target.value) || 10 })}
                                className="w-14 p-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center text-xs"
                              />
                              <span className="text-[10px] text-slate-400">px</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400">
                                {t("uiColor")}
                              </span>
                              <input
                                type="color"
                                value={block.color}
                                onChange={(e) => handleUpdateCustomText(block.id, { color: e.target.value })}
                                className="w-6 h-6 rounded cursor-pointer p-0"
                              />
                            </div>

                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={block.isBold ?? true}
                                onChange={(e) => handleUpdateCustomText(block.id, { isBold: e.target.checked })}
                                className="w-3.5 h-3.5 rounded"
                              />
                              <span className="text-[10px] font-bold">
                                {t("uiBold")}
                              </span>
                            </label>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Quick Action to jump to preview */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 lg:hidden shrink-0 bg-slate-50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setMobileViewMode("preview")}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[var(--brand-surface)] text-[var(--brand-primary)] border border-[var(--brand-border)] hover:bg-[var(--brand-primary)] hover:text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Eye className="w-4 h-4" />
                  <span>{t("uiViewLiveA4CanvasPreview")}</span>
                </button>
              </div>
            </div>

            {/* Right Column: LIVE REAL-TIME A4 PRESCRIPTION PREVIEW */}
            <div
              className={`flex-1 flex flex-col overflow-hidden bg-slate-200/70 dark:bg-slate-950 ${
                mobileViewMode === "preview" ? "flex" : "hidden lg:flex"
              }`}
            >
              {/* Preview Top Toolbar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-surface)] border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMobileViewMode("controls")}
                    className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer shadow-xs"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{t("uiControls")}</span>
                  </button>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 hidden sm:inline">
                    {t("uiLiveA4PreviewRealScale")}
                  </span>
                </div>

                {/* Responsive Zoom Controls */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.max(40, prev - 10))}
                    disabled={zoom <= 40}
                    title="Zoom Out"
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 w-12 text-center select-none">
                    {zoom}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.min(140, prev + 10))}
                    disabled={zoom >= 140}
                    title="Zoom In"
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />
                  <button
                    type="button"
                    onClick={() => setZoom(100)}
                    title="Reset Zoom to 100%"
                    className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(65)}
                    title="Fit to Screen"
                    className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 cursor-pointer sm:hidden"
                  >
                    Fit
                  </button>
                </div>
              </div>

              {/* Scrollable Canvas Viewport */}
              <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex justify-center items-start">
                <div
                  className="transition-transform duration-150 origin-top shrink-0"
                  style={{
                    transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
                  }}
                >
                  <div
                    className="relative w-[680px] max-w-[680px] shadow-2xl rounded-2xl border transition-all duration-150 overflow-hidden"
                    style={{
                      backgroundColor: backgroundColor,
                      color: textColor,
                      borderColor: themeColor,
                      minHeight: "880px",
                      paddingLeft: `${contentPaddingX}px`,
                      paddingRight: `${contentPaddingX}px`,
                      paddingTop: "28px",
                      paddingBottom: "28px",
                    }}
                  >
                {/* 1. Behind Logo (Watermark) Layer */}
                {showWatermark && watermarkUrl && (
                  <div
                    className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 select-none overflow-hidden"
                    style={{
                      transform: `translate(${watermarkX}px, ${watermarkY}px)`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={watermarkUrl}
                      alt="Prescription Watermark"
                      style={{
                        opacity: watermarkOpacity,
                        width: `${watermarkSize}px`,
                        height: `${watermarkSize}px`,
                        objectFit: "contain",
                      }}
                    />
                  </div>
                )}

                {/* 2. Floating Custom Text Blocks ("Place text anywhere") */}
                {customTextBlocks.map((b) => (
                  <div
                    key={b.id}
                    className="absolute z-30 pointer-events-none select-none tracking-wider"
                    style={{
                      left: `${b.x}%`,
                      top: `${b.y}%`,
                      fontSize: `${b.fontSize}px`,
                      color: b.color,
                      fontWeight: b.isBold ? "bold" : "normal",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {b.text}
                  </div>
                ))}

                {/* 3. Foreground Document Content */}
                <div className="relative z-10 flex flex-col justify-between h-full min-h-[820px]">
                  {/* Top Header */}
                  <header
                    className="border-b-2 pb-3.5 mb-3"
                    style={{
                      borderColor: themeColor,
                      backgroundColor: headerBgColor !== "#ffffff" ? headerBgColor : undefined,
                      transform: `translateY(${headerOffsetY}px)`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h1
                          className="font-black tracking-tight"
                          style={{
                            fontSize: `${hospitalTitleSize}px`,
                            color: themeColor,
                          }}
                        >
                          {hospitalName}
                        </h1>
                        {showHospitalTagline && hospitalTagline && (
                          <p className="font-semibold text-slate-500 text-[11px] mt-0.5">
                            {hospitalTagline}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {hospitalAddress}
                        </p>
                      </div>

                      {showHospitalLogo && logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoUrl}
                          alt="Logo"
                          className="h-12 w-auto object-contain rounded"
                        />
                      )}
                    </div>

                    {showHospitalContactBar && (
                      <div
                        className="mt-2.5 pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 font-medium"
                        style={{ borderColor: `${themeColor}33` }}
                      >
                        <span>📞 {hospitalPhone}</span>
                        <span>✉️ {hospitalEmail}</span>
                        <span>🌐 {hospitalWebsite}</span>
                      </div>
                    )}
                  </header>

                  {/* Doctor Credentials & Patient Info Bar */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-start text-xs border-b pb-2.5" style={{ borderColor: `${themeColor}22` }}>
                      <div>
                        <h2
                          className="font-black"
                          style={{
                            fontSize: `${doctorTitleSize}px`,
                            color: themeColor,
                          }}
                        >
                          Dr. Fahim Rahman
                        </h2>
                        <p className="font-bold text-slate-700">MBBS, FCPS (Medicine), MACP (USA)</p>
                        <p className="text-[11px] text-slate-600">
                          {t("uiSeniorConsultantDepartmentOfInternal")}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {t("uiBmdcRegNoBMDCA")}
                        </p>
                      </div>

                      <div className="text-right text-[11px]">
                        <p className="font-bold text-slate-800">
                          {t("uiChamberRoomRdFloor")}
                        </p>
                        <p className="text-slate-500">
                          {t("uiVisitingHoursAMPM")}
                        </p>
                        <p className="text-slate-500">
                          {t("uiContact")}
                        </p>
                      </div>
                    </div>

                    {/* Patient Information Strip */}
                    <div
                      className="p-2.5 rounded-xl border flex flex-wrap items-center justify-between text-[11px] font-semibold"
                      style={{
                        backgroundColor: `${themeColor}0d`,
                        borderColor: `${themeColor}33`,
                      }}
                    >
                      <span>{t.patientName}: <strong>{t("uiNusratJahan")}</strong></span>
                      <span>{t.age}: <strong>{t("uiYrs")}</strong></span>
                      <span>{t.gender}: <strong>{t("genderFemale")}</strong></span>
                      <span>{t("uiDate")} <strong>{t("uiNov")}</strong></span>
                      <span>Rx ID: <code className="font-mono text-[10px]">#RX-7892</code></span>
                    </div>

                    {/* Vitals Box */}
                    {showVitals && (
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-medium text-slate-600">
                        <span className="font-bold uppercase tracking-wider text-slate-400">
                          {t("uiVitals")}
                        </span>
                        <span>BP: <strong>120/80 mmHg</strong></span>
                        <span>{t("uiPulse")} <strong>76 bpm</strong></span>
                        <span>{t("uiWeight")} <strong>62 kg</strong></span>
                        <span>{t("uiTemp")} <strong>98.6 °F</strong></span>
                      </div>
                    )}

                    {/* Clinical Body Split: Left Side (Notes) & Right Side (Rx Items) */}
                    <div className="grid grid-cols-12 gap-4 pt-2">
                      {/* Left: Clinical Complaints & Diagnosis */}
                      {(showClinicalNotes || showDiagnosis) && (
                        <div className="col-span-4 border-r pr-3 space-y-3" style={{ borderColor: `${themeColor}22` }}>
                          {showClinicalNotes && (
                            <div>
                              <h4 className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: themeColor }}>
                                {t.chiefComplaints}
                              </h4>
                              <p style={{ fontSize: `${bodyFontSize}px` }} className="text-slate-600 leading-snug">
                                {language === "bn" ? (
                                  <>• জ্বর x ৩ দিন<br />• তীব্র গলা ব্যথা<br />• শুকনো কাশি</>
                                ) : (
                                  <>• Fever x 3 days<br />• Severe throat ache<br />• Dry productive cough</>
                                )}
                              </p>
                            </div>
                          )}

                          {showDiagnosis && (
                            <div>
                              <h4 className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: themeColor }}>
                                {t.clinicalDiagnosis}
                              </h4>
                              <p style={{ fontSize: `${bodyFontSize}px` }} className="font-bold text-slate-800 leading-snug">
                                {t("uiAcutePharyngitisWithUpperRespiratory")}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Right: Prescribed Medicines & Lab Investigations */}
                      <div className={(showClinicalNotes || showDiagnosis) ? "col-span-8" : "col-span-12"}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="font-serif text-2xl font-black italic" style={{ color: themeColor }}>
                            Rx
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {t("uiMedicationsDosage")}
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {[
                            { name: "Tab. Ciprocin 500mg", type: "Tablet", freq: "1+0+1", dur: t("uiDays4"), inst: t("uiAfterMealWithPlentyOf") },
                            { name: "Tab. Napa Extra 500mg+65mg", type: "Tablet", freq: "1+1+1", dur: t("uiDays"), inst: t("uiIfFeverExceedsF") },
                            { name: "Cap. Maxpro 20mg", type: "Capsule", freq: "1+0+1", dur: t("uiDays7"), inst: t("uiMinutesBeforeBreakfastDinner") },
                          ].map((med, i) => (
                            <div key={i} className="pb-1.5 border-b border-slate-100 last:border-b-0">
                              <p className="font-bold text-slate-900" style={{ fontSize: `${rxItemFontSize}px` }}>
                                {i + 1}. {med.name}
                              </p>
                              <p className="text-[11px] text-slate-600 font-medium">
                                ↳ {med.freq} — {med.dur} ({med.inst})
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer: Signature block and Disclaimer */}
                  <footer className="mt-8 pt-4 border-t-2" style={{ borderColor: themeColor }}>
                    {showSignatureBlock && (
                      <div
                        className="flex justify-between items-end mb-3"
                        style={{ transform: `translateY(${signatureOffsetY}px)` }}
                      >
                        <div className="text-[10px] text-slate-400">
                          <p>{t("uiIssuedByMetropolitanHealthClinical")}</p>
                          <p>{t("uiPrescriptionVerification")} <strong>VERIFIED-2026-OK</strong></p>
                        </div>
                        <div className="text-right">
                          <div className="w-40 border-b border-slate-400 mb-1" />
                          <p className="text-[11px] font-bold text-slate-800">Dr. Fahim Rahman</p>
                          <p className="text-[10px] text-slate-400">
                            {t("uiRegisteredMedicalPractitioner")}
                          </p>
                        </div>
                      </div>
                    )}

                    {showDisclaimer && disclaimer && (
                      <p
                        className="text-slate-400 text-center leading-relaxed"
                        style={{ fontSize: `${disclaimerFontSize}px` }}
                      >
                        {disclaimer}
                      </p>
                    )}
                  </footer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
);
}
