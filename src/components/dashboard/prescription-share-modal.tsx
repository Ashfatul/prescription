"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Mail,
  QrCode,
  Share2,
  X,
  Loader2,
  Globe,
  Lock,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { notifyToast } from "@/lib/toast";

type PrescriptionShareModalProps = {
  prescriptionId: string;
  prescriptionNumber?: string;
  isOpen: boolean;
  onClose: () => void;
};

export function PrescriptionShareModal({
  prescriptionId,
  prescriptionNumber,
  isOpen,
  onClose,
}: PrescriptionShareModalProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Email form
  const [recipientEmail, setRecipientEmail] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !prescriptionId) return;

    let isMounted = true;

    fetch(`/api/prescriptions/${prescriptionId}/share`)
      .then((res) => res.json())
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setIsPublic(!!res.data.isPublicShareEnabled);
          setShareUrl(res.data.shareUrl || "");
          setQrDataUrl(res.data.qrDataUrl || "");
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load prescription sharing details.");
          notifyToast("Failed to load prescription sharing details.", "error");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, prescriptionId]);

  if (!isOpen) return null;

  async function handleTogglePublic() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/prescriptions/${prescriptionId}/share`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enable: !isPublic }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setIsPublic(data.data.isPublicShareEnabled);
        setShareUrl(data.data.shareUrl || "");
        setQrDataUrl(data.data.qrDataUrl || "");
      } else {
        const message = data.message || "Failed to update sharing preference.";
        setError(message);
        notifyToast(message, "error");
      }
    } catch {
      const message = "An unexpected network error occurred.";
      setError(message);
      notifyToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      notifyToast(t.copied, "success");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadQr() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `Prescription_QR_${prescriptionId.slice(-6)}.png`;
    a.click();
  }

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientEmail) return;

    setSendingEmail(true);
    setError(null);
    setEmailSuccess(null);

    try {
      const res = await fetch(`/api/prescriptions/${prescriptionId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail,
          personalNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailSuccess(`${t.emailSentSuccess} (${recipientEmail})`);
        setRecipientEmail("");
        setPersonalNote("");
        setIsPublic(true);
        if (data.data?.shareUrl) setShareUrl(data.data.shareUrl);
        notifyToast(t.emailSentSuccess, "success");
      } else {
        const message = data.message || "Failed to send email.";
        setError(message);
        notifyToast(message, "error");
      }
    } catch {
      const message = "Failed to send email alert.";
      setError(message);
      notifyToast(message, "error");
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="modal-header shrink-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {t.sharePrescription}
              </h2>
              <p className="text-xs text-slate-500">
                Rx #{prescriptionNumber || prescriptionId.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="modal-body flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          {emailSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              {emailSuccess}
            </div>
          )}

          {/* Public Sharing Toggle Card */}
          <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {isPublic ? (
                  <Globe className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {t.publicWebLinkAccess}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {isPublic ? t.publicLinkShareDesc : t.privateLinkShareDesc}
              </p>
            </div>

            <button
              onClick={handleTogglePublic}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isPublic
                  ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                  : "bg-[var(--brand-primary)] text-white hover:opacity-95"
              }`}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{isPublic ? t.disableLink : t.enableSharing}</span>
            </button>
          </div>

          {/* When Sharing is Active: Link & QR Code Display */}
          {isPublic && (
            <div className="space-y-4">
              {/* Copyable URL Bar */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t.publicLink}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs text-slate-700 dark:text-slate-300 select-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-2.5 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] hover:bg-[var(--brand-primary)] hover:text-white transition text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? t.copied : t.copyKey}</span>
                  </button>
                </div>
              </div>

              {/* QR Code Section */}
              {qrDataUrl && (
                <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrDataUrl}
                      alt="Prescription QR Code"
                      className="w-16 h-16 rounded-xl border border-[var(--border-subtle)] p-1 bg-white"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                        <span>{t.instantMobileScanQr}</span>
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {t.scanMobileQrDesc}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="p-2.5 rounded-xl border border-[var(--border-default)] text-slate-700 dark:text-slate-300 hover:bg-[var(--bg-subtle)] transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.saveQr}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Email Sharing Form */}
          <form onSubmit={handleSendEmail} className="pt-2 border-t border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--brand-primary)]" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {t.sendPrescriptionToEmail}
              </span>
            </div>

            <div className="grid gap-3">
              <input
                type="email"
                required
                placeholder={t.patientEmailPlaceholder}
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs placeholder:text-slate-400 focus:outline-none focus:border-[var(--brand-primary)]"
              />
              <input
                type="text"
                placeholder={t.personalNotePlaceholder}
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs placeholder:text-slate-400 focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <button
              type="submit"
              disabled={sendingEmail || !recipientEmail}
              className="w-full py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {sendingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
              <span>{sendingEmail ? t.sendingEmail : t.sendPrescriptionEmail}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
