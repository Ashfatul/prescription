"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  Printer,
  QrCode,
  RotateCcw,
  Sparkles,
  Tv,
} from "lucide-react";

export function ChamberQueuePreview() {
  const [currentSerial, setCurrentSerial] = useState(4);
  const [justAdvanced, setJustAdvanced] = useState(false);

  const handleAdvance = () => {
    setCurrentSerial((prev) => (prev >= 12 ? 1 : prev + 1));
    setJustAdvanced(true);
    setTimeout(() => setJustAdvanced(false), 1200);
  };

  const handleReset = () => {
    setCurrentSerial(1);
    setJustAdvanced(false);
  };

  const patientNames = [
    "Tariqul Islam",
    "Nusrat Jahan",
    "Kamrul Hasan",
    "Farzana Akter",
    "Md. Rafiqul Alam",
    "Nasreen Sultana",
    "Anisur Rahman",
    "Shamima Begum",
    "Zubair Ahmed",
    "Tahmina Parveen",
    "Abdul Mannan",
    "Rashida Khanam",
  ];

  const currentPatientName = patientNames[(currentSerial - 1) % patientNames.length];
  const nextPatientName = patientNames[currentSerial % patientNames.length];
  const waitingCount = 12 - (currentSerial % 12);

  return (
    <section
      id="chamber-queue"
      className="w-full py-16 sm:py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] scroll-mt-20 relative overflow-hidden"
    >
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[var(--brand-primary)]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] text-xs font-bold uppercase tracking-wider border border-[var(--brand-border)] shadow-2xs">
            <Activity className="w-3.5 h-3.5 text-[var(--brand-primary)] animate-pulse" />
            <span>OPD Triage & Live Queue Dispenser</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Zero Waiting Room Crowding.{" "}
            <span className="bg-gradient-to-r from-[var(--brand-primary)] to-teal-500 bg-clip-text text-transparent">
              Live Token Calling.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Give patients real-time serial visibility from waiting area display TVs or their smartphones. Front desk staff issue physical tokens with 1 click while doctors advance room calls effortlessly.
          </p>
        </div>

        {/* Interactive Dual-Panel Showcase: Live Calling Screen + Printed Token Slip */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Waiting Room Digital TV Screen (7 Cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-[var(--bg-app)] border border-[var(--border-default)] shadow-lg p-5 sm:p-7 space-y-6">
            {/* Display TV Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>OPD Chamber 301 Calling Display</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </h3>
                  <p className="text-xs text-slate-500">Dr. Fahim Rahman • General Medicine</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Live Stream Active</span>
                </span>
              </div>
            </div>

            {/* Calling Display Box */}
            <div
              className={`rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 border ${
                justAdvanced
                  ? "bg-[var(--brand-surface)] border-[var(--brand-primary)] scale-[1.01] shadow-md"
                  : "bg-[var(--bg-surface)] border-[var(--border-subtle)] shadow-xs"
              }`}
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] text-xs font-bold uppercase tracking-wider mb-3">
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                <span>Now Consulting</span>
              </div>

              <div className="text-6xl sm:text-7xl lg:text-8xl font-black text-[var(--brand-text)] tracking-tight font-mono">
                #{currentSerial.toString().padStart(2, "0")}
              </div>

              <div className="mt-2 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {currentPatientName}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please proceed to Room 301, 3rd Floor
              </p>
            </div>

            {/* Waiting Sequence Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Next in Line
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block truncate">
                  #{((currentSerial % 12) + 1).toString().padStart(2, "0")} • {nextPatientName}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Lobby Waiting
                </span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block">
                  {waitingCount} Patients
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Est. Wait Time
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                  ~{waitingCount * 6} mins
                </span>
              </div>
            </div>

            {/* Interactive Simulation Controls */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAdvance}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white font-bold shadow-xs hover:opacity-95 transition cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Call Next Patient (#{((currentSerial % 12) + 1).toString().padStart(2, "0")})</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  title="Reset counter"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Interactive live queue simulator</span>
              </span>
            </div>
          </div>

          {/* Right Panel: Realistic Physical Token Slip Preview (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl bg-[var(--bg-app)] border border-[var(--border-default)] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Printer className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>Printed Thermal Token Slip</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-500/10">
                  Auto-Printed at Check-in
                </span>
              </div>

              {/* Realistic Paper Thermal Ticket */}
              <div className="relative rounded-2xl bg-white text-slate-900 p-5 shadow-md border border-slate-200 font-sans space-y-3.5">
                {/* Paper Ticket Header */}
                <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-0.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Metropolitan Hospital
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    OPD Chamber Triage & Consultation Token
                  </p>
                  <p className="text-[9px] font-mono text-slate-400">
                    Issued: {new Date().toLocaleDateString()} • 10:45 AM
                  </p>
                </div>

                {/* Big Token Number */}
                <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                    Your Queue Serial
                  </span>
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono">
                    #{currentSerial.toString().padStart(2, "0")}
                  </span>
                  <span className="text-[11px] font-bold text-teal-700 block mt-0.5">
                    {currentPatientName}
                  </span>
                </div>

                {/* Chamber Details */}
                <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[11px]">Specialist:</span>
                    <span className="font-bold text-slate-800 text-[11px]">Dr. Fahim Rahman</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[11px]">Room / Chamber:</span>
                    <span className="font-bold text-slate-800 text-[11px]">Room 301, 3rd Floor</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[11px]">Pre-Triage BP:</span>
                    <span className="font-bold text-slate-800 text-[11px]">120/80 mmHg</span>
                  </div>
                </div>

                {/* QR Code for Mobile Tracking */}
                <div className="pt-1 flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold uppercase text-slate-800 block">
                      Live Smartphone Tracking
                    </span>
                    <p className="text-[9px] text-slate-500 leading-tight">
                      Scan QR code to step away to the cafeteria and track your turn live.
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-lg p-1 border border-slate-200 flex items-center justify-center shrink-0">
                    <QrCode className="w-10 h-10 text-slate-800" />
                  </div>
                </div>

                {/* Footer Barcode */}
                <div className="text-center pt-1">
                  <div className="h-6 w-full flex items-center justify-center gap-0.5 opacity-60">
                    <span className="w-0.5 h-5 bg-slate-900" />
                    <span className="w-1 h-5 bg-slate-900" />
                    <span className="w-0.5 h-5 bg-slate-900" />
                    <span className="w-1.5 h-5 bg-slate-900" />
                    <span className="w-0.5 h-5 bg-slate-900" />
                    <span className="w-2 h-5 bg-slate-900" />
                    <span className="w-0.5 h-5 bg-slate-900" />
                    <span className="w-1 h-5 bg-slate-900" />
                    <span className="w-1.5 h-5 bg-slate-900" />
                    <span className="w-0.5 h-5 bg-slate-900" />
                    <span className="w-2 h-5 bg-slate-900" />
                    <span className="w-0.5 h-5 bg-slate-900" />
                  </div>
                  <span className="text-[8px] font-mono text-slate-400 tracking-wider">
                    * PPMS-TK-{currentSerial.toString().padStart(4, "0")} *
                  </span>
                </div>
              </div>

              {/* Quick Action to Staff Portal */}
              <div className="pt-2 text-center">
                <Link
                  href="/dashboard/staff"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-text)] hover:underline"
                >
                  <span>Explore Reception Triage Station</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* 3 Pillar Benefits */}
        <div className="grid sm:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Smart TV & Screen Ready</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Open the live chamber URL on any waiting room TV or monitor without specialized hardware.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>1-Click Thermal Printing</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Compatible with 58mm/80mm thermal receipt printers and standard laser printers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Doctor-Controlled Flow</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Doctors advance serials right from their dashboard without yelling or receptionist interruptions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
