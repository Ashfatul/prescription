"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  Microscope,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { CustomSelect } from "@/components/common/custom-select";
import { CustomDatePicker } from "@/components/common/custom-date-picker";

type TestReportItem = {
  id: string;
  title: string;
  description?: string | null;
  reportDate: string;
  fileUrl: string;
  fileType: string;
  originalName: string;
  status: "PENDING" | "REVIEWED" | "NORMAL" | "ABNORMAL";
  notes?: string | null;
  patient: {
    id: string;
    user: { name: string; email: string };
  };
  doctor?: {
    id: string;
    user: { name: string };
  } | null;
  uploadedBy: {
    id: string;
    name: string;
    role: { name: string };
  };
  createdAt: string;
};

type TestReportsManagerProps = {
  role: "DOCTOR" | "PATIENT" | "STAFF" | "SUPER_ADMIN";
  patientId?: string;
};

export function TestReportsManager({ role, patientId }: TestReportsManagerProps) {
  const [reports, setReports] = useState<TestReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
  const [fileUrl, setFileUrl] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Review modal state (Doctor)
  const [selectedReport, setSelectedReport] = useState<TestReportItem | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"PENDING" | "REVIEWED" | "NORMAL" | "ABNORMAL">("REVIEWED");
  const [reviewNotes, setReviewNotes] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  // Filter
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchReports = () => {
    setLoading(true);
    const url = patientId
      ? `/api/test-reports?patientId=${patientId}`
      : "/api/test-reports";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setReports(data.data);
        }
      })
      .catch(() => setError("Failed to load test reports."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let isMounted = true;
    const url = patientId
      ? `/api/test-reports?patientId=${patientId}`
      : "/api/test-reports";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data)) {
          setReports(data.data);
        }
      })
      .catch(() => {
        if (isMounted) setError("Failed to load test reports.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [patientId]);

  const handleFileUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setOriginalName(file.name);

    // Upload to /api/files/upload
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        setFileUrl(data.data.url);
      } else {
        // Fallback to data URL or dummy if cloudinary isn't configured
        const reader = new FileReader();
        reader.onload = (event) => {
          setFileUrl(event.target?.result as string || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Fallback
      setFileUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setSubmitting(true);
    setError(null);

    const finalUrl = fileUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    const finalName = originalName || `${title.replace(/\s+/g, "_")}.pdf`;

    try {
      const res = await fetch("/api/test-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          reportDate,
          fileUrl: finalUrl,
          originalName: finalName,
          patientId: patientId || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUploadModalOpen(false);
        setTitle("");
        setDescription("");
        setFileUrl("");
        setUploadFile(null);
        fetchReports();
      } else {
        setError(data.message || "Failed to add report.");
      }
    } catch {
      setError("Network error uploading report.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveReview = async () => {
    if (!selectedReport) return;
    setSavingReview(true);
    try {
      const res = await fetch(`/api/test-reports/${selectedReport.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewStatus,
          notes: reviewNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedReport(null);
        fetchReports();
      }
    } catch {
      // Ignore
    } finally {
      setSavingReview(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test report?")) return;
    try {
      await fetch(`/api/test-reports/${id}`, { method: "DELETE" });
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // Ignore
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NORMAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Normal</span>
          </span>
        );
      case "ABNORMAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px]">
            <AlertTriangle className="w-3 h-3" />
            <span>Abnormal Findings</span>
          </span>
        );
      case "REVIEWED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-[10px]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Doctor Reviewed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  const filteredReports = statusFilter === "ALL"
    ? reports
    : reports.filter((r) => r.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold">
              <Microscope className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Diagnostic Test Reports & Scans
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Pathology blood panels, radiology scans, and laboratory diagnostic PDFs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Status Filter */}
          <div className="w-48">
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: "ALL", label: "All Reports" },
                { value: "PENDING", label: "Pending Review" },
                { value: "REVIEWED", label: "Doctor Reviewed" },
                { value: "NORMAL", label: "Normal" },
                { value: "ABNORMAL", label: "Abnormal" },
              ]}
              searchable={false}
            />
          </div>

          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Report</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Reports Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--brand-primary)] mb-2" />
          <span>Loading diagnostic reports...</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
          <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No Test Reports Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {role === "PATIENT"
              ? "You haven't uploaded any diagnostic reports yet. Click 'Upload New Report' to attach blood tests or scans."
              : "No diagnostic reports found for this filter criteria."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-border)]/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  {getStatusBadge(report.status)}
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[var(--brand-text)] transition truncate">
                    {report.title}
                  </h3>
                  {report.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1 text-[11px] text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Patient:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {report.patient.user.name}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Report Date:</span>
                    <span className="font-mono">
                      {new Date(report.reportDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Uploaded By:</span>
                    <span>
                      {report.uploadedBy.name} ({report.uploadedBy.role.name})
                    </span>
                  </div>
                  {report.doctor && (
                    <div className="flex items-center justify-between">
                      <span>Assigned Doctor:</span>
                      <strong className="text-teal-700 dark:text-teal-400">
                        {report.doctor.user.name}
                      </strong>
                    </div>
                  )}
                </div>

                {report.notes && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-[var(--border-subtle)] text-[11px]">
                    <span className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                      Doctor Clinical Review:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-snug">
                      {report.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] hover:bg-[var(--brand-primary)] hover:text-white transition text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>View / Download</span>
                </a>

                <div className="flex items-center gap-1">
                  {(role === "DOCTOR" || role === "SUPER_ADMIN") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReport(report);
                        setReviewStatus(report.status);
                        setReviewNotes(report.notes || "");
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-[var(--border-default)] text-slate-600 dark:text-slate-300 hover:bg-[var(--bg-subtle)] transition text-xs font-semibold cursor-pointer"
                    >
                      Review
                    </button>
                  )}

                  {(role === "SUPER_ADMIN" || report.uploadedBy.id === report.patient.user.name) && (
                    <button
                      type="button"
                      onClick={() => handleDelete(report.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete Report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[var(--brand-primary)]" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Upload Diagnostic Report
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                  Report Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Blood Count (CBC) or Chest X-Ray"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Date of Test
                  </label>
                  <CustomDatePicker
                    value={reportDate}
                    onChange={(val) => setReportDate(val)}
                    placeholder="Select test date"
                    maxDate={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Report File (PDF / Image) *
                  </label>
                  <label className="w-full px-4 rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-subtle)] hover:bg-[var(--brand-surface)] transition text-center cursor-pointer flex items-center justify-center gap-2 truncate min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px] text-sm">
                    <Upload className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                    <span className="truncate">{uploadFile ? uploadFile.name : "Select Document"}</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUploadChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                  Clinical Summary / Findings (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Hemoglobin 14.2 g/dL, normal platelet count, clear lung fields"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-default)] text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title}
                  className="px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white font-bold shadow-xs hover:opacity-95 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{submitting ? "Uploading..." : "Save Report"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Physician Clinical Review
              </h3>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Report:</span>
                <strong className="text-slate-900 dark:text-white text-sm">
                  {selectedReport.title}
                </strong>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Diagnostic Status
                </label>
                <CustomSelect
                  value={reviewStatus}
                  onChange={(val) =>
                    setReviewStatus(
                      val as "PENDING" | "REVIEWED" | "NORMAL" | "ABNORMAL"
                    )
                  }
                  options={[
                    { value: "REVIEWED", label: "Reviewed (Satisfactory)" },
                    { value: "NORMAL", label: "Normal Findings" },
                    { value: "ABNORMAL", label: "Abnormal / Action Required" },
                    { value: "PENDING", label: "Pending Further Tests" },
                  ]}
                  searchable={false}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Doctor Notes & Instructions for Patient
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Blood counts normal, advise to repeat FBS in 3 months."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-default)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReview}
                  disabled={savingReview}
                  className="px-5 py-2 rounded-xl bg-[var(--brand-primary)] text-white font-bold"
                >
                  {savingReview ? "Saving..." : "Save Assessment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
