"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Activity,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  ShieldCheck,
  Stethoscope,
  Tv,
  Users,
  XCircle,
} from "lucide-react";

export type DoctorQueueData = {
  id: string;
  name: string;
  imageUrl: string | null;
  specialization: string;
  degrees: string | null;
  designation: string | null;
  hospital: string | null;
  bmdcRegNo: string | null;
  chamberAddress: string | null;
  visitingHours: string | null;
  consultationFee: string | null;
  available: boolean;
  currentSerial: number;
  totalToday: number;
  completedCount: number;
  waitingCount: number;
  missedCount: number;
  currentPatient: {
    serialNumber: number;
    safeName: string;
    status: string;
  } | null;
  previousPatient: {
    serialNumber: number;
    safeName: string;
    status: string;
  } | null;
  nextPatient: {
    serialNumber: number;
    safeName: string;
    status: string;
  } | null;
  upcomingPatients: Array<{
    serialNumber: number;
    safeName: string;
    status: string;
  }>;
  missedPatients: Array<{
    serialNumber: number;
    safeName: string;
    status: string;
  }>;
};

const CYCLE_INTERVAL_SECONDS = 15;

export function HospitalQueueDisplay({
  initialDoctorId,
  clinicSlug,
}: {
  initialDoctorId?: string;
  clinicSlug?: string;
}) {
  const { t, language } = useLanguage();
  const [doctors, setDoctors] = useState<DoctorQueueData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(CYCLE_INTERVAL_SECONDS);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  const effectiveClinicSlug =
    clinicSlug ||
    (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("clinic") || undefined : undefined);

  // Live wall clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }) +
          " • " +
          now.toLocaleDateString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial fetch and 6s background polling for realtime queue updates
  useEffect(() => {
    let isMounted = true;

    const fetchQueue = () => {
      const url = effectiveClinicSlug
        ? `/api/public/live-queue?clinic=${encodeURIComponent(effectiveClinicSlug)}`
        : "/api/public/live-queue";
      fetch(url, { cache: "no-store" })
        .then((res) => {
          if (!res.ok) return null;
          return res.json();
        })
        .then((json) => {
          if (!isMounted || !json?.success || !Array.isArray(json.data?.doctors)) return;
          setDoctors(json.data.doctors);
          if (initialDoctorId) {
            const idx = json.data.doctors.findIndex((d: DoctorQueueData) => d.id === initialDoctorId);
            if (idx !== -1) {
              setSelectedIndex(idx);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to fetch live queue data:", err);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    fetchQueue();
    const pollTimer = setInterval(fetchQueue, 6000);
    return () => {
      isMounted = false;
      clearInterval(pollTimer);
    };
  }, [initialDoctorId, effectiveClinicSlug]);

  // Auto-cycle timer
  useEffect(() => {
    if (doctors.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setSelectedIndex((current) => (current + 1) % doctors.length);
          return CYCLE_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [doctors.length, isPaused]);

  // Reset timer on manual selection
  const handleSelectDoctor = (index: number) => {
    setSelectedIndex(index);
    setSecondsRemaining(CYCLE_INTERVAL_SECONDS);
  };

  const handleNextDoctor = () => {
    if (doctors.length === 0) return;
    setSelectedIndex((prev) => (prev + 1) % doctors.length);
    setSecondsRemaining(CYCLE_INTERVAL_SECONDS);
  };

  const handlePrevDoctor = () => {
    if (doctors.length === 0) return;
    setSelectedIndex((prev) => (prev - 1 + doctors.length) % doctors.length);
    setSecondsRemaining(CYCLE_INTERVAL_SECONDS);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported or blocked
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const selectedDoctor = doctors[selectedIndex] || null;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center animate-pulse shadow-md">
          <Activity className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
          {t.connectingOpdCalling}
        </p>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-3">
        <Tv className="w-12 h-12 text-slate-400" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          {t.noActiveChambers}
        </h2>
        <p className="text-xs text-slate-500 max-w-md">
          {t.noActiveChambersDesc}
        </p>
        <Link
          href="/doctors"
          className="mt-2 px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-95"
        >
          {t.viewAllSpecialists}
        </Link>
      </div>
    );
  }

  const cycleProgress = ((CYCLE_INTERVAL_SECONDS - secondsRemaining) / CYCLE_INTERVAL_SECONDS) * 100;

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)] transition-all ${
        isFullscreen ? "h-screen overflow-y-auto p-4 sm:p-6 lg:p-8" : ""
      }`}
    >
      {/* 1. TOP HEADER: High-Contrast TV Display Status Bar */}
      <header className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
            OPD
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t.liveOpdCallingMonitor}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-500">
              {t.autoSynchronizesStations}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Real-time wall clock */}
          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>{currentTime}</span>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition shadow-2xs cursor-pointer"
            title={isFullscreen ? t.exitFullscreen : t.tvMode}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? t.exitFullscreen : t.tvMode}</span>
          </button>
        </div>
      </header>

      {/* 2. AUTO-CYCLE PROGRESS & CONTROLS STRIP */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevDoctor}
              className="p-1.5 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-slate-600 dark:text-slate-300 transition"
              title={language === "bn" ? "পূর্ববর্তী ডাক্তার" : "Previous Doctor"}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition ${
                isPaused
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                  : "border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-slate-600 dark:text-slate-300"
              }`}
              title={isPaused ? (language === "bn" ? "অটো-সাইকেল চালু করুন" : "Resume Auto-Cycling") : (language === "bn" ? "এই ডাক্তারের উপর থামুন" : "Pause on this Doctor")}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleNextDoctor}
              className="p-1.5 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-slate-600 dark:text-slate-300 transition"
              title={language === "bn" ? "পরবর্তী ডাক্তার" : "Next Doctor"}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {t.chamber} {selectedIndex + 1} {t.ofText} {doctors.length}:
            </span>
            <span className="font-bold text-[var(--brand-text)]">
              {selectedDoctor?.name} ({selectedDoctor?.specialization})
            </span>
          </div>
        </div>

        {/* Small Timer Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">
              {isPaused ? (language === "bn" ? "অটো-সাইকেল স্থগিত" : "Auto-cycling paused") : (language === "bn" ? `${secondsRemaining} সেকেন্ডে পরিবর্তন` : `Cycling in ${secondsRemaining}s`)}
            </span>
            <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-[var(--brand-primary)] transition-all duration-300"
                style={{ width: `${isPaused ? 0 : cycleProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN DISPLAY BODY (Grid: Doctor Chambers Sidebar + Main Stage Screen) */}
      <div className="grid lg:grid-cols-12 gap-6 items-start flex-1">
        
        {/* Left Column: All Working Doctors List (4 Cols on desktop) */}
        <div className="lg:col-span-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>{t.consultingPhysicians} ({doctors.length})</span>
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10">
              {language === "bn" ? "লাইভ আপডেট" : "Live Updates"}
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto px-1.5 py-1">
            {doctors.map((doc, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => handleSelectDoctor(idx)}
                  className={`relative w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-[var(--brand-surface)] border-[var(--brand-primary)] shadow-xs ring-1 ring-[var(--brand-primary)]/40"
                      : "bg-[var(--bg-app)] border-[var(--border-subtle)] hover:border-[var(--brand-border)] hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  {/* Dedicated active selection accent strip */}
                  {isSelected && (
                    <span
                      className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[var(--brand-primary)]"
                      aria-hidden="true"
                    />
                  )}
                  <div className="flex items-center gap-3 truncate">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] shrink-0">
                      {doc.imageUrl ? (
                        <Image src={doc.imageUrl} alt={doc.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-400">
                          Dr.
                        </div>
                      )}
                    </div>
                    <div className="truncate">
                      <h4
                        className={`text-xs font-extrabold truncate ${
                          isSelected ? "text-[var(--brand-text)]" : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {doc.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">{doc.specialization}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {doc.chamberAddress || (language === "bn" ? "ওপিডি চেম্বার কক্ষ" : "OPD Chamber Room")}
                      </p>
                    </div>
                  </div>

                  {/* Calling Serial Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                      {t.nowCalling}
                    </span>
                    <span
                      className={`text-base font-black font-mono block ${
                        isSelected ? "text-[var(--brand-text)]" : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      #{doc.currentSerial || "0"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {doc.waitingCount} {language === "bn" ? "অপেক্ষমাণ" : "waiting"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Patient Instruction Card */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[11px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              {language === "bn" ? "রোগীদের জন্য নির্দেশিকা:" : "Patient Guidance:"}
            </span>
            <p className="leading-relaxed">
              {language === "bn"
                ? "এই ডিসপ্লেটি স্বয়ংক্রিয়ভাবে সকল চেম্বারের তথ্য প্রদর্শন করে। নির্দিষ্ট চিকিৎসকের জন্য উপরের তালিকায় ক্লিক করুন বা তাদের প্রোফাইল দেখুন।"
                : "This display rotates automatically through all chambers. If you are waiting for a specific physician, click their name above or visit their direct page."}
            </p>
          </div>
        </div>

        {/* Right Stage: Selected Doctor Detailed Screen (8 Cols on desktop) */}
        {selectedDoctor && (
          <div className="lg:col-span-8 space-y-6">
            {/* Doctor Chamber Card Header */}
            <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[var(--bg-subtle)] border-2 border-[var(--brand-border)] shadow-md shrink-0">
                  {selectedDoctor.imageUrl ? (
                    <Image
                      src={selectedDoctor.imageUrl}
                      alt={selectedDoctor.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-lg text-slate-400">
                      Dr.
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] text-[10px] font-bold uppercase tracking-wider border border-[var(--brand-border)]">
                    <Stethoscope className="w-3 h-3" />
                    <span>{selectedDoctor.specialization}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {selectedDoctor.name}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {selectedDoctor.degrees || (language === "bn" ? "বিশেষজ্ঞ চিকিৎসক" : "Specialist Physician")}{" "}
                    {selectedDoctor.designation ? `• ${selectedDoctor.designation}` : ""}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {selectedDoctor.chamberAddress || "OPD Chamber 301, 3rd Floor"} • BMDC: {selectedDoctor.bmdcRegNo || (language === "bn" ? "ভেরিফায়েড" : "Verified")}
                  </p>
                </div>
              </div>

              {/* Direct Link to Doctor Profile Page */}
              <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                <Link
                  href={`/doctors/${selectedDoctor.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] hover:bg-[var(--brand-primary)] hover:text-white transition font-bold text-xs border border-[var(--brand-border)] shadow-2xs"
                >
                  <span>{language === "bn" ? "ডাক্তারের বিস্তারিত ও সময়সূচী" : "Open Doctor Details & Schedule"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[10px] text-slate-400 font-medium">
                  {language === "bn" ? "রোগী দেখার সময়:" : "Visiting:"} {selectedDoctor.visitingHours || (language === "bn" ? "শনি - বৃহঃ বিকাল ৫:০০ - রাত ৯:০০" : "Sat - Thu: 5:00 PM - 9:00 PM")}
                </span>
              </div>
            </div>

            {/* Central Giant Calling Display Box */}
            <div className="rounded-3xl border-2 border-[var(--brand-primary)] bg-[var(--bg-surface)] p-6 sm:p-10 shadow-lg text-center space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--brand-primary)]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] text-xs font-black uppercase tracking-widest border border-[var(--brand-border)] shadow-xs">
                <Bell className="w-4 h-4 animate-bounce text-[var(--brand-primary)]" />
                <span>{t.nowConsultingInChamber}</span>
              </div>

              {selectedDoctor.currentSerial > 0 ? (
                <>
                  <div className="text-7xl sm:text-8xl lg:text-9xl font-black text-[var(--brand-text)] font-mono tracking-tight leading-none py-2">
                    #{selectedDoctor.currentSerial.toString().padStart(2, "0")}
                  </div>

                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {selectedDoctor.currentPatient?.safeName || `${t.tokenNumber} #${selectedDoctor.currentSerial}`}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 font-semibold">
                    {t.pleaseProceedTo} {selectedDoctor.chamberAddress || (language === "bn" ? "ডাক্তার পরামর্শ চেম্বার" : "Doctor Consultation Chamber")}
                  </p>
                </>
              ) : (
                <div className="py-8 space-y-2">
                  <div className="text-4xl sm:text-5xl font-black text-slate-400 font-mono">
                    #--
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t.noActiveConsultationSession}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.doctorPreparingChamber}
                  </p>
                </div>
              )}
            </div>

            {/* Patient Flow: Running, Previous, Next & Missed Serials */}
            <div className="grid sm:grid-cols-12 gap-4">
              
              {/* Previous Patient (4 cols) */}
              <div className="sm:col-span-4 p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-1.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t.previousPatient}</span>
                </span>
                {selectedDoctor.previousPatient ? (
                  <div>
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono block">
                      #{selectedDoctor.previousPatient.serialNumber.toString().padStart(2, "0")}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block truncate">
                      {selectedDoctor.previousPatient.safeName}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">{language === "bn" ? "সম্পন্ন" : "Completed"}</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 block pt-1 font-medium">{language === "bn" ? "আজকে এখনও নেই" : "None yet today"}</span>
                )}
              </div>

              {/* Next in Lobby (4 cols) */}
              <div className="sm:col-span-4 p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-1.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.nextInLobby}</span>
                </span>
                {selectedDoctor.nextPatient ? (
                  <div>
                    <span className="text-xl font-extrabold text-[var(--brand-text)] font-mono block">
                      #{selectedDoctor.nextPatient.serialNumber.toString().padStart(2, "0")}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block truncate">
                      {selectedDoctor.nextPatient.safeName}
                    </span>
                    <span className="text-[10px] text-amber-600 font-medium">{t.pleaseBeReady}</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 block pt-1 font-medium">{language === "bn" ? "লাইনে কোনো রোগী নেই" : "No patient next in line"}</span>
                )}
              </div>

              {/* Missed / Skipped Serials (4 cols) */}
              <div className="sm:col-span-4 p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-1.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t.missedSkippedCalls}</span>
                </span>
                {selectedDoctor.missedPatients.length > 0 ? (
                  <div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedDoctor.missedPatients.map((m) => (
                        <span
                          key={m.serialNumber}
                          className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-bold text-xs"
                        >
                          #{m.serialNumber.toString().padStart(2, "0")}
                        </span>
                      ))}
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-1 leading-tight">
                      {t.reportToReceptionRequeue}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 block pt-1 font-medium">{t.zeroMissedCalls}</span>
                )}
              </div>

            </div>

            {/* Upcoming Queue Serial Ribbon */}
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {t.upcomingQueueInLine}
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === "bn" ? "আজকের মোট বুকিং:" : "Total Booked Today:"} <strong>{selectedDoctor.totalToday}</strong> • {language === "bn" ? "অপেক্ষমাণ:" : "Waiting:"}{" "}
                  <strong>{selectedDoctor.waitingCount}</strong>
                </span>
              </div>

              {selectedDoctor.upcomingPatients.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {selectedDoctor.upcomingPatients.map((patient) => (
                    <div
                      key={patient.serialNumber}
                      className="p-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-center space-y-0.5"
                    >
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 block">
                        #{patient.serialNumber.toString().padStart(2, "0")}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {patient.safeName}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-2">
                  {language === "bn" ? "বর্তমানে কিউতে কোনো অপেক্ষমাণ রোগী নেই।" : "No additional patients currently queued in line."}
                </p>
              )}
            </div>

            {/* Discretion & Instruction Footer Banner */}
            <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>{t.safePublicDisplay}</strong> {t.safePublicDisplayNotice}
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                {language === "bn" ? "চিকিৎসক ও ক্লিনিক্যাল কর্মীরা চেম্বার থেকে সিরিয়াল নম্বর পরিবর্তন করেন।" : "Calling serials are advanced by clinical staff and doctors inside the consulting room."}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
