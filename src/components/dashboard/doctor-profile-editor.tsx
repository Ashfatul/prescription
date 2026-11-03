"use client";

import { FormEvent, useRef, useState } from "react";
import Image from "next/image";
import { ChangePasswordCard } from "@/components/common/change-password-card";
import { TwoFactorAuthCard } from "@/components/common/two-factor-auth-card";
import { CustomSelect } from "@/components/common/custom-select";
import { useLanguage } from "@/lib/i18n/language-context";

export type DoctorProfile = {
  id: string;
  specialization: string;
  degrees?: string | null;
  designation?: string | null;
  hospital?: string | null;
  bmdcRegNo?: string | null;
  chamberAddress?: string | null;
  contactNumber?: string | null;
  available: boolean;
  bio?: string | null;
  visitingHours?: string | null;
  consultationFee?: string | null;
  newPatientFee?: number | null;
  followupFee?: number | null;
  followupValidityDays?: number | null;
  reportFreeDays?: number | null;
  experienceYears?: string | null;
  signatureUrl?: string | null;
  user: {
    name: string;
    email: string;
    phone?: string | null;
    signatureUrl?: string | null;
  };
};

export function DoctorProfileEditor({
  doctor,
  onSaved,
}: {
  doctor: DoctorProfile;
  onSaved?: (updated: Partial<DoctorProfile>) => void;
}) {
  const { t, language } = useLanguage();
  const [specialization, setSpecialization] = useState(doctor.specialization || "");
  const [degrees, setDegrees] = useState(doctor.degrees || "");
  const [designation, setDesignation] = useState(doctor.designation || "");
  const [hospital, setHospital] = useState(doctor.hospital || "");
  const [bmdcRegNo, setBmdcRegNo] = useState(doctor.bmdcRegNo || "");
  const [chamberAddress, setChamberAddress] = useState(doctor.chamberAddress || "");
  const [contactNumber, setContactNumber] = useState(doctor.contactNumber || "");
  const [bio, setBio] = useState(doctor.bio || "");
  const [visitingHours, setVisitingHours] = useState(doctor.visitingHours || "");
  const [consultationFee, setConsultationFee] = useState(doctor.consultationFee || "");
  const [newPatientFee, setNewPatientFee] = useState<number>(doctor.newPatientFee ?? 50);
  const [followupFee, setFollowupFee] = useState<number>(doctor.followupFee ?? 30);
  const [followupValidityDays, setFollowupValidityDays] = useState<number>(doctor.followupValidityDays ?? 90);
  const [reportFreeDays, setReportFreeDays] = useState<number>(doctor.reportFreeDays ?? 2);
  const [experienceYears, setExperienceYears] = useState(doctor.experienceYears || "");
  const [signatureUrl, setSignatureUrl] = useState(doctor.signatureUrl || doctor.user.signatureUrl || "");
  const [available, setAvailable] = useState(doctor.available);

  const [saving, setSaving] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Digital Signature Canvas Drawing State
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Image File Upload to /api/files/upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate image file type
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please upload a valid image file (PNG, JPG, or WEBP)." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Signature file size exceeds 5MB limit." });
      return;
    }

    setUploadingSignature(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setUploadingSignature(false);

      if (!res.ok || !data.success || !data.data?.url) {
        setMessage({ type: "error", text: data.message || "Failed to upload signature image." });
        return;
      }

      setSignatureUrl(data.data.url);
      setMessage({
        type: "success",
        text: "Signature image uploaded successfully! Click 'Save Changes' to update your credentials.",
      });
    } catch {
      setUploadingSignature(false);
      setMessage({ type: "error", text: "Network error while uploading signature. Please try again." });
    }
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `signature-${doctor.id}.png`, { type: "image/png" });
      await handleFileUpload(file);
      setIsDrawingOpen(false);
    }, "image/png");
  };

  // Submit Profile Changes
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/doctors/${doctor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialization,
          degrees,
          designation,
          hospital,
          bmdcRegNo,
          chamberAddress,
          contactNumber,
          bio,
          visitingHours,
          consultationFee,
          newPatientFee: Number(newPatientFee) || 50,
          followupFee: Number(followupFee) || 30,
          followupValidityDays: Number(followupValidityDays) || 90,
          reportFreeDays: Number(reportFreeDays) ?? 2,
          experienceYears,
          signatureUrl,
          available,
        }),
      });

      const data = await res.json();
      setSaving(false);

      if (!res.ok || !data.success) {
        setMessage({ type: "error", text: data.message || "Failed to update profile." });
        return;
      }

      setMessage({
        type: "success",
        text: t.profileUpdatedSuccess,
      });

      onSaved?.({
        specialization,
        degrees,
        designation,
        hospital,
        bmdcRegNo,
        chamberAddress,
        contactNumber,
        bio,
        visitingHours,
        consultationFee,
        newPatientFee: Number(newPatientFee) || 50,
        followupFee: Number(followupFee) || 30,
        followupValidityDays: Number(followupValidityDays) || 90,
        reportFreeDays: Number(reportFreeDays) ?? 2,
        experienceYears,
        signatureUrl,
        available,
      });
    } catch {
      setSaving(false);
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-8">
      {/* Top Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-text)]">
            {t.physicianCredentialsPublicProfile}
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {t.doctorProfileDigitalSignature}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.doctorProfileDesc}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3.5 py-1 text-xs font-semibold ${
              available
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
            }`}
          >
            {available ? t.acceptingPatients : t.currentlyAway}
          </span>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-2xl p-4 text-xs font-medium flex items-center justify-between gap-3 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
              : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200"
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Official Medical Credentials */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            {t.officialCredentialsDesignation}
          </h4>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.doctorFullNameRegistered}
              </label>
              <input
                disabled
                value={doctor.user.name}
                className="w-full rounded-2xl border border-slate-200 bg-slate-100/70 px-3.5 py-2.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.specializationFieldPractice} *
              </label>
              <input
                required
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder={t.specializationPlaceholder}
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.hospitalInstitutionAffiliation} *
              </label>
              <input
                required
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder={t.hospitalPlaceholder}
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.clinicalDesignationRank}
              </label>
              <input
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder={t.designationPlaceholder}
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.degreesQualifications}
              </label>
              <input
                value={degrees}
                onChange={(e) => setDegrees(e.target.value)}
                placeholder={t.degreesPlaceholder}
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.bmdcMedicalRegNo}
              </label>
              <input
                value={bmdcRegNo}
                onChange={(e) => setBmdcRegNo(e.target.value)}
                placeholder={t.bmdcRegPlaceholder}
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)] font-mono"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.clinicalExperienceYears}
              </label>
              <input
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder={t.experienceYearsPlaceholder}
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Chamber Practice & Consultation Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            {t.chamberLocationPracticeHours}
          </h4>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.chamberRoomLocation}
              </label>
              <input
                value={chamberAddress}
                onChange={(e) => setChamberAddress(e.target.value)}
                placeholder={t.chamberAddressPlaceholder}
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.visitingChamberHours}
              </label>
              <input
                value={visitingHours}
                onChange={(e) => setVisitingHours(e.target.value)}
                placeholder={t.visitingHoursPlaceholder}
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.consultationFeeSummary}
              </label>
              <input
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                placeholder={t.consultationFeePlaceholder}
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.appointmentChamberHotline}
              </label>
              <input
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder={t.hotlinePlaceholder}
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)] font-mono"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.consultationStatus}
              </label>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="h-4 w-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] cursor-pointer"
                  />
                  <span>{t.activeForLiveSerialBooking}</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t.chamberNotesBanner}
            </label>
            <input
              value={consultationFee}
              onChange={(e) => setConsultationFee(e.target.value)}
              placeholder="e.g. $50 First Visit / $30 Follow-up (Free report review in 2 days)"
              className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t.doctorBiographyClinicalFocus}
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t.doctorBioPlaceholder}
              className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] p-3.5 text-xs outline-none focus:border-[var(--brand-primary)] leading-relaxed resize-y"
            />
          </div>
        </div>

        {/* Section 3: Consultation Fees & Visiting Policy */}
        <div className="space-y-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 p-5">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {t.multiTierFeesVisitingPolicy}
              </h4>
              <p className="text-[11px] text-slate-500">
                {t.configurePatientCharges}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {t.liveDynamicCalculation}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t.newPatientFeeLabel} ($) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={newPatientFee}
                onChange={(e) => setNewPatientFee(Number(e.target.value))}
                placeholder="50"
                className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-[var(--brand-primary)]"
              />
              <span className="mt-1 block text-[10px] text-slate-400">{t.firstTimeConsultationCharge}</span>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t.followupFeeLabel} ($) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={followupFee}
                onChange={(e) => setFollowupFee(Number(e.target.value))}
                placeholder="30"
                className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-[var(--brand-primary)]"
              />
              <span className="mt-1 block text-[10px] text-slate-400">{t.returningPatientRate}</span>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t.followupValidityLabel}
              </label>
              <CustomSelect
                allowClear={false}
                value={String(followupValidityDays)}
                onChange={(val) => setFollowupValidityDays(Number(val))}
                options={[
                  { value: "30", label: t.opt30Days },
                  { value: "60", label: t.opt60Days },
                  { value: "90", label: t.opt90Days },
                  { value: "180", label: t.opt180Days },
                ]}
                searchable={false}
              />
              <span className="mt-1 block text-[10px] text-slate-400">{t.requiresPreviousPrescription}</span>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t.freeReportReviewLabel}
              </label>
              <CustomSelect
                allowClear={false}
                value={String(reportFreeDays)}
                onChange={(val) => setReportFreeDays(Number(val))}
                options={[
                  { value: "0", label: t.optNoFree },
                  { value: "2", label: t.opt2Days },
                  { value: "3", label: t.opt3Days },
                  { value: "5", label: t.opt5Days },
                  { value: "7", label: t.opt7Days },
                ]}
                searchable={false}
              />
              <span className="mt-1 block text-[10px] text-slate-400">{t.diagnosticReportCheckWindow}</span>
            </div>
          </div>

          {/* Visual Policy Explanation Strip */}
          <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-3 text-xs text-[var(--brand-text)] flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-bold block">{t.summaryOfChamberPolicy}</span>
              <p className="text-[11px] leading-relaxed opacity-90">
                • <strong>{language === "bn" ? "নতুন রোগী:" : "New Patients:"}</strong> {language === "bn" ? `প্রথম পরামর্শে ফি $${newPatientFee}।` : `Charged $${newPatientFee} for first consultation.`}<br />
                • <strong>{language === "bn" ? "টেস্টের রিপোর্ট প্রদর্শন:" : "Diagnostic Report Showing:"}</strong> {language === "bn" ? `ভিজিটের ${reportFreeDays} দিনের মধ্যে বিনামূল্যে ($০.০০)।` : `Free ($0.00) within ${reportFreeDays} days of initial visit.`}<br />
                • <strong>{language === "bn" ? "ফলো-আপ ভিজিট:" : "Follow-up Visits:"}</strong> {language === "bn" ? `পূর্বের প্রেসক্রিপশনসহ ${followupValidityDays} দিনের মধ্যে আসলে ফি $${followupFee}।` : `Charged $${followupFee} if presenting within ${followupValidityDays} days with verified previous prescription.`}
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Digital Signature & Prescription Authentication */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.digitalSignatureTitle}
            </h4>
            <span className="text-[11px] text-slate-500">
              {t.signatureAppearsDesc}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Signature Preview Box */}
            <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.signatureDisplay}
              </span>

              {signatureUrl ? (
                <div className="space-y-3">
                  <div className="relative h-28 rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-center overflow-hidden shadow-inner">
                    <Image
                      src={signatureUrl}
                      alt="Doctor Digital Signature"
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>✓</span> {t.activeSignatureAttached}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSignatureUrl("")}
                      className="text-red-500 hover:text-red-700 font-bold hover:underline cursor-pointer"
                    >
                      {t.removeSignature}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center p-3 text-slate-400 text-xs">
                  <span className="text-2xl mb-1">✍️</span>
                  <span>{t.noSignatureUploaded}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {t.physicalStampFallback}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Signature Upload / Draw Actions */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.uploadOrDrawSignature}
              </span>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Upload Image Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />

                <button
                  type="button"
                  disabled={uploadingSignature}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] hover:bg-slate-100 dark:hover:bg-slate-800 p-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 transition shadow-xs cursor-pointer disabled:opacity-60"
                >
                  <span>📁</span>
                  <span>{uploadingSignature ? t.uploading : t.uploadImageFile}</span>
                </button>

                {/* Draw Signature Button */}
                <button
                  type="button"
                  onClick={() => setIsDrawingOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] hover:bg-[var(--brand-primary)] hover:text-white p-3.5 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <span>🖊️</span>
                  <span>{t.drawOnScreen}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                💡 <strong>{t.tipForBestResults}</strong> {t.tipSignatureDesc}
              </p>
            </div>
          </div>

          {/* Interactive Draw Signature Canvas Modal / Drawer */}
          {isDrawingOpen && (
            <div className="p-4 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)]/20 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.drawSignatureWithTouch}
                </span>
                <span className="text-[11px] text-slate-500">{t.signInsideBox}</span>
              </div>

              <div className="border border-slate-300 dark:border-slate-700 rounded-xl bg-white overflow-hidden shadow-inner flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={150}
                  className="touch-none cursor-crosshair w-full max-w-[500px] h-[150px]"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t.clearCanvas}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDrawingOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    disabled={uploadingSignature}
                    onClick={saveCanvasSignature}
                    className="px-4 py-1.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-90 cursor-pointer disabled:opacity-60"
                  >
                    {uploadingSignature ? t.saving : t.useDrawnSignature}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving || uploadingSignature}
            className="rounded-2xl bg-[var(--brand-primary)] px-8 py-3 text-xs font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-70 cursor-pointer"
          >
            {saving ? t.savingCredentials : t.saveDoctorProfileBtn}
          </button>
        </div>
      </form>

      {/* Account Security, Two-Factor Authentication & Password Management */}
      <div className="mt-8 space-y-6">
        <TwoFactorAuthCard />
        <ChangePasswordCard />
      </div>
    </div>
  );
}
