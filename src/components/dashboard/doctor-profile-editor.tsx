"use client";

import { FormEvent, useRef, useState } from "react";
import Image from "next/image";

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
    ctx.strokeStyle = "#0f172a"; // Crisp dark ink color
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
        text: "Doctor profile & digital signature saved successfully! Updated details will reflect on your public specialist page and all prescription prints.",
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
            Physician Credentials & Public Profile
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            Doctor Profile & Digital Signature
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Update your professional information shown on your dedicated doctor details page and official prescription headers.
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
            {available ? "● Accepting Patients" : "○ Currently Away"}
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
            1. Official Credentials & Designation
          </h4>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Doctor Full Name (Registered)
              </label>
              <input
                disabled
                value={doctor.user.name}
                className="w-full rounded-2xl border border-slate-200 bg-slate-100/70 px-3.5 py-2.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Specialization / Field of Practice *
              </label>
              <input
                required
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Internal Medicine, Cardiology, Neurology"
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Hospital / Institution Affiliation *
              </label>
              <input
                required
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="e.g. Metropolitan Specialized Hospital"
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Clinical Designation / Rank
              </label>
              <input
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Senior Consultant / Associate Professor"
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Degrees & Qualifications
              </label>
              <input
                value={degrees}
                onChange={(e) => setDegrees(e.target.value)}
                placeholder="e.g. MBBS, FCPS (Medicine), MD (Cardiology)"
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                BMDC / Medical Registration No
              </label>
              <input
                value={bmdcRegNo}
                onChange={(e) => setBmdcRegNo(e.target.value)}
                placeholder="e.g. BMDC-A-41285"
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)] font-mono"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Clinical Experience (Years)
              </label>
              <input
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="e.g. 14+ Years"
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Chamber Practice & Consultation Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            2. Chamber Location & Practice Hours
          </h4>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Chamber / Room Location
              </label>
              <input
                value={chamberAddress}
                onChange={(e) => setChamberAddress(e.target.value)}
                placeholder="e.g. Room 301, 3rd Floor, West Wing"
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Visiting / Chamber Hours
              </label>
              <input
                value={visitingHours}
                onChange={(e) => setVisitingHours(e.target.value)}
                placeholder="e.g. Sat - Thu: 5:00 PM - 9:30 PM"
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Consultation Fee
              </label>
              <input
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                placeholder="e.g. ৳ 1,000 (New) / ৳ 600 (Follow-up)"
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Appointment / Chamber Hotline
              </label>
              <input
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g. +880 1711-234567 / 10678"
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-primary)] font-mono"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Consultation Status
              </label>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="h-4 w-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] cursor-pointer"
                  />
                  <span>Active & available for live serial booking queue</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Doctor Biography & Clinical Focus (Public Profile)
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Dr. ... is a highly regarded specialist with extensive experience in managing acute and chronic disorders..."
              className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-app)] p-3.5 text-xs outline-none focus:border-[var(--brand-primary)] leading-relaxed resize-y"
            />
          </div>
        </div>

        {/* Section 3: Digital Signature & Prescription Authentication */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Digital Signature for Official Prescriptions
            </h4>
            <span className="text-[11px] text-slate-500">
              Appears on live prescription previews, downloads, and official prints
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Signature Preview Box */}
            <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Signature Display on Prescriptions
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
                      <span>✓</span> Active Signature Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => setSignatureUrl("")}
                      className="text-red-500 hover:text-red-700 font-bold hover:underline cursor-pointer"
                    >
                      Remove Signature
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center p-3 text-slate-400 text-xs">
                  <span className="text-2xl mb-1">✍️</span>
                  <span>No digital signature uploaded yet</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Physical stamp line will be used as fallback
                  </span>
                </div>
              )}
            </div>

            {/* Right: Signature Upload / Draw Actions */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Upload or Draw Signature
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
                  <span>{uploadingSignature ? "Uploading..." : "Upload Image (PNG/JPG)"}</span>
                </button>

                {/* Draw Signature Button */}
                <button
                  type="button"
                  onClick={() => setIsDrawingOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] hover:bg-[var(--brand-primary)] hover:text-white p-3.5 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <span>🖊️</span>
                  <span>Draw on Screen</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                💡 <strong>Tip for best results:</strong> Upload a transparent background PNG or a crisp photo of your signature written on plain white paper. Or use the &quot;Draw on Screen&quot; pad on mobile/tablet or touch device.
              </p>
            </div>
          </div>

          {/* Interactive Draw Signature Canvas Modal / Drawer */}
          {isDrawingOpen && (
            <div className="p-4 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)]/20 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Draw Signature with Touch / Mouse:
                </span>
                <span className="text-[11px] text-slate-500">Sign inside the box below</span>
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
                  Clear Canvas
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDrawingOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={uploadingSignature}
                    onClick={saveCanvasSignature}
                    className="px-4 py-1.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-90 cursor-pointer disabled:opacity-60"
                  >
                    {uploadingSignature ? "Saving..." : "Use Drawn Signature"}
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
            {saving ? "Saving Credentials..." : "Save Professional Profile & Signature"}
          </button>
        </div>
      </form>
    </div>
  );
}
