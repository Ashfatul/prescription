"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Mail,
  Plus,
  Edit2,
  Trash2,
  Send,
  Eye,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { notifyToast } from "@/lib/toast";

export interface EmailTemplateItem {
  id: string;
  key: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string | null;
  description?: string | null;
  availableVars?: string[] | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const inputClasses =
  "w-full px-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[44px] h-[44px]";

const textareaClasses =
  "w-full p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all font-mono leading-relaxed";

export function EmailTemplateManager() {
  const { t, language } = useLanguage();
  const [templates, setTemplates] = useState<EmailTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Create/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplateItem | null>(null);
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [description, setDescription] = useState("");
  const [availableVars, setAvailableVars] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Test Email Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testTargetTemplate, setTestTargetTemplate] = useState<EmailTemplateItem | null>(null);
  const [testRecipient, setTestRecipient] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchTemplates = () => {
    setLoading(true);
    fetch("/api/email-templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTemplates(data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load email templates", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    let mounted = true;
    fetch("/api/email-templates")
      .then((res) => res.json())
      .then((data) => {
        if (mounted && data.success && Array.isArray(data.data)) {
          setTemplates(data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load email templates", err);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setKey("");
    setName("");
    setSubject("");
    setBodyHtml(`<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #f8fafc; padding: 24px;">
  <div style="max-width: 540px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 16px;">
    <h2 style="color: #0f766e;">{{appName}}</h2>
    <h3>Hello {{userName}},</h3>
    <p>This is a custom notification message from {{appName}}.</p>
  </div>
</body>
</html>`);
    setBodyText("Hello {{userName}},\n\nThis is a notification from {{appName}}.");
    setDescription("");
    setAvailableVars(["userName", "userEmail", "appName", "supportEmail"]);
    setPreviewMode(false);
    setFormError(null);
    setFormSuccess(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: EmailTemplateItem) => {
    setEditingTemplate(item);
    setKey(item.key);
    setName(item.name);
    setSubject(item.subject);
    setBodyHtml(item.bodyHtml);
    setBodyText(item.bodyText || "");
    setDescription(item.description || "");
    setAvailableVars(
      Array.isArray(item.availableVars) ? (item.availableVars as string[]) : []
    );
    setPreviewMode(false);
    setFormError(null);
    setFormSuccess(null);
    setModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!name.trim() || !subject.trim() || !bodyHtml.trim()) {
      const message = "Template name, subject, and HTML body are required.";
      setFormError(message);
      notifyToast(message, "error");
      return;
    }

    startTransition(async () => {
      try {
        const url = editingTemplate
          ? `/api/email-templates/${editingTemplate.id}`
          : "/api/email-templates";
        const method = editingTemplate ? "PATCH" : "POST";

        const payload: Record<string, unknown> = {
          name: name.trim(),
          subject: subject.trim(),
          bodyHtml,
          bodyText: bodyText.trim() || undefined,
          description: description.trim() || undefined,
          availableVars,
        };

        if (!editingTemplate) {
          payload.key = key.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
        }

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (json.success) {
          setFormSuccess("Template saved successfully.");
          notifyToast("Template saved successfully.", "success");
          setTimeout(() => {
            setModalOpen(false);
            fetchTemplates();
          }, 800);
        } else {
          const message = json.error || json.message || "Failed to save template.";
          setFormError(message);
          notifyToast(message, "error");
        }
      } catch {
        const message = "Network error occurred while saving template.";
        setFormError(message);
        notifyToast(message, "error");
      }
    });
  };

  const handleDelete = async (id: string, templateName: string) => {
    if (!confirm(`Are you sure you want to permanently delete custom template "${templateName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/email-templates/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        notifyToast("Template deleted successfully.", "success");
      } else {
        notifyToast(json.error || json.message || "Failed to delete template.", "error");
      }
    } catch {
      notifyToast("Network error occurred.", "error");
    }
  };

  const handleOpenTestModal = (item: EmailTemplateItem) => {
    setTestTargetTemplate(item);
    setTestRecipient("");
    setTestResult(null);
    setTestModalOpen(true);
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTargetTemplate || !testRecipient.trim()) return;

    setTestSending(true);
    setTestResult(null);

    try {
      const res = await fetch(`/api/email-templates/${testTargetTemplate.id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: testRecipient.trim() }),
      });

      const json = await res.json();
      if (json.success) {
        setTestResult({
          success: true,
          message: json.message || `Test email dispatched to ${testRecipient.trim()} via SMTP.`,
        });
        notifyToast(json.message || `Test email dispatched to ${testRecipient.trim()} via SMTP.`, "success");
      } else {
        const message = json.error || json.message || "Failed to send test email.";
        setTestResult({
          success: false,
          message,
        });
        notifyToast(message, "error");
      }
    } catch {
      const message = "Network error occurred while communicating with SMTP service.";
      setTestResult({
        success: false,
        message,
      });
      notifyToast(message, "error");
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold shadow-xs">
              <Mail className="w-5 h-5 text-[var(--brand-primary)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--brand-surface)] text-[var(--brand-text)]">
                  SaaS Communications
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium">• SMTP Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {t.emailTemplatesManagement}
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {t.emailTemplatesDesc}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-98 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.newEmailTemplate}</span>
        </button>
      </div>

      {/* Templates List */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[var(--brand-primary)]" />
            <span>{t.loadingEmailTemplates}</span>
          </div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            {t("uiNoEmailTemplatesConfiguredYet")}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {tpl.key}
                    </span>
                    {tpl.isSystem ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                        System Core Template
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                        Custom Task Template
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {tpl.name}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium">
                    <strong className="text-slate-700 dark:text-slate-300">
                      {t("uiSubject")}
                    </strong>{" "}
                    {tpl.subject}
                  </p>

                  {tpl.description && (
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {tpl.description}
                    </p>
                  )}

                  {Array.isArray(tpl.availableVars) && tpl.availableVars.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <span className="text-[10px] font-semibold text-slate-400 mr-1">
                        {t("uiVariables")}
                      </span>
                      {tpl.availableVars.map((v) => (
                        <span
                          key={v}
                          className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--brand-text)] border border-[var(--border-subtle)]"
                        >
                          {"{{" + v + "}}"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenTestModal(tpl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition shadow-2xs"
                    title={t.testEmail}
                  >
                    <Send className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{t.testEmail}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(tpl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] hover:opacity-90 text-xs font-bold cursor-pointer transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{t.edit}</span>
                  </button>

                  {!tpl.isSystem && (
                    <button
                      type="button"
                      onClick={() => handleDelete(tpl.id, tpl.name)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title={t.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Template Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-3xl rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
            <div className="modal-header shrink-0 flex items-center justify-between px-6 py-4 sm:px-8 border-b border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {editingTemplate ? `Edit Template: ${editingTemplate.name}` : "Create Custom Email Template"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Configure subject, dynamic variable placeholders, and HTML markup
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-[var(--bg-subtle)] text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="modal-body flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 text-xs">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold">
                    {formSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                      Template Key Identifier *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!!editingTemplate}
                      placeholder="e.g. LAB_REPORT_READY"
                      value={key}
                      onChange={(e) => setKey(e.target.value.toUpperCase().replace(/\s+/g, "_"))}
                      className={`${inputClasses} font-mono disabled:opacity-60 disabled:cursor-not-allowed`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                      Friendly Template Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Diagnostic Lab Results Notification"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Email Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Your test report is available - {{appName}}"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={inputClasses}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Template Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dispatched to patient when test report status is marked NORMAL or ABNORMAL."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={inputClasses}
                  />
                </div>

                {/* Supported Dynamic Variables Reference */}
                <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                    <span>Available Placeholders (Click to insert into Subject / HTML):</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {availableVars.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          const token = `{{${v}}}`;
                          setBodyHtml((prev) => prev + token);
                        }}
                        className="font-mono text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-[var(--brand-primary)] border border-slate-200 dark:border-slate-700 hover:border-[var(--brand-primary)] cursor-pointer"
                      >
                        +{`{{${v}}}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* HTML Body with Live Preview Switch */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                      HTML Email Body *
                    </label>
                    <button
                      type="button"
                      onClick={() => setPreviewMode(!previewMode)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{previewMode ? "Show HTML Code" : "Render Live Preview"}</span>
                    </button>
                  </div>

                  {previewMode ? (
                    <div className="p-4 rounded-xl border border-[var(--border-default)] bg-white min-h-[300px] overflow-auto">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: bodyHtml
                            .replace(/\{\{userName\}\}/g, "Dr. Alice Morgan")
                            .replace(/\{\{userEmail\}\}/g, "alice@example.com")
                            .replace(/\{\{appName\}\}/g, "PPMS Health")
                            .replace(/\{\{verifyUrl\}\}/g, "http://localhost:3000/auth/verify-email?token=SAMPLE_TOKEN")
                            .replace(/\{\{resetUrl\}\}/g, "http://localhost:3000/auth/reset-password?token=SAMPLE_TOKEN")
                            .replace(/\{\{clinicName\}\}/g, "Metropolitan Specialized Hospital"),
                        }}
                      />
                    </div>
                  ) : (
                    <textarea
                      rows={12}
                      required
                      value={bodyHtml}
                      onChange={(e) => setBodyHtml(e.target.value)}
                      className={textareaClasses}
                    />
                  )}
                </div>

                {/* Plaintext Fallback */}
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Plain Text Alternative (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    className={textareaClasses}
                    placeholder="Plain text fallback for minimalist email clients..."
                  />
                </div>
              </div>

              <div className="modal-footer shrink-0 flex items-center justify-end gap-3 px-6 py-4 sm:px-8 border-t border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white font-bold shadow-md hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? t.saving : t.saveTemplate}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test SMTP Email Modal */}
      {testModalOpen && testTargetTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
            <div className="modal-header shrink-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {t.sendTestNotification}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t.templateStudioNav}: {testTargetTemplate.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-[var(--bg-subtle)] text-slate-400 flex items-center justify-center font-bold text-sm cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendTestEmail} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="modal-body flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t("uiThisWillSendALive")}
                </p>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs font-semibold ${
                      testResult.success
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-600"
                    }`}
                  >
                    {testResult.message}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    {t.recipientEmail} *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. doctor.test@example.com"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="modal-footer shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-default)] text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  {t.close}
                </button>
                <button
                  type="submit"
                  disabled={testSending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white font-bold shadow-md hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {testSending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{t.sendingTestEmail}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{t.sendTestNotification}</span>
                    </>
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
