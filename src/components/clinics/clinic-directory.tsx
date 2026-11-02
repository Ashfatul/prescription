"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Mail,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  X,
  Users,
} from "lucide-react";

export type ClinicDoctor = {
  id: string;
  specialization: string;
  degrees?: string | null;
  chamberAddress?: string | null;
  available?: boolean;
  user: {
    name: string;
    imageUrl: string | null;
    email: string;
  };
};

export type ClinicItem = {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "TRIAL" | "SUSPENDED" | "PENDING_APPROVAL";
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  logoUrl: string | null;
  createdAt: string | Date;
  plan: {
    id: string;
    name: string;
    price: number;
    billingCycle: string;
    description?: string | null;
  } | null;
  _count: {
    doctors: number;
    patients: number;
    appointments: number;
    prescriptions: number;
  };
  doctors: ClinicDoctor[];
};

interface ClinicDirectoryProps {
  initialClinics: ClinicItem[];
}

export function ClinicDirectory({ initialClinics }: ClinicDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "WITH_DOCTORS">("ALL");
  const [sortBy, setSortBy] = useState<"doctors" | "recent" | "alpha">("doctors");

  // Filtering clinics
  const filteredClinics = useMemo(() => {
    return initialClinics.filter((clinic) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        clinic.name.toLowerCase().includes(q) ||
        (clinic.address && clinic.address.toLowerCase().includes(q)) ||
        (clinic.contactPhone && clinic.contactPhone.toLowerCase().includes(q)) ||
        (clinic.contactEmail && clinic.contactEmail.toLowerCase().includes(q)) ||
        clinic.doctors.some(
          (doc) =>
            doc.user.name.toLowerCase().includes(q) ||
            doc.specialization.toLowerCase().includes(q)
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && clinic.status === "ACTIVE") ||
        (statusFilter === "WITH_DOCTORS" && clinic._count.doctors > 0);

      return matchesSearch && matchesStatus;
    });
  }, [initialClinics, searchQuery, statusFilter]);

  // Sorting clinics
  const sortedClinics = useMemo(() => {
    const list = [...filteredClinics];
    if (sortBy === "doctors") {
      list.sort((a, b) => b._count.doctors - a._count.doctors);
    } else if (sortBy === "recent") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "alpha") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [filteredClinics, sortBy]);

  // Total metrics
  const totalDoctors = useMemo(() => {
    return initialClinics.reduce((sum, c) => sum + c._count.doctors, 0);
  }, [initialClinics]);

  const totalPatients = useMemo(() => {
    return initialClinics.reduce((sum, c) => sum + c._count.patients, 0);
  }, [initialClinics]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Toolbar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clinics by name, district, address, phone or practicing physician..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 text-sm text-[var(--text-primary)] placeholder:text-slate-400 transition-all outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Chips & Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  statusFilter === "ALL"
                    ? "bg-[var(--brand-primary)] text-white shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-[var(--text-primary)]"
                }`}
              >
                All ({initialClinics.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ACTIVE")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  statusFilter === "ACTIVE"
                    ? "bg-[var(--brand-primary)] text-white shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-[var(--text-primary)]"
                }`}
              >
                Active Only
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("WITH_DOCTORS")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  statusFilter === "WITH_DOCTORS"
                    ? "bg-[var(--brand-primary)] text-white shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-[var(--text-primary)]"
                }`}
              >
                With Doctors
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "doctors" | "recent" | "alpha")}
                aria-label="Sort clinics by criteria"
                className="px-3 py-2 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
              >
                <option value="doctors">Most Doctors First</option>
                <option value="recent">Recently Added</option>
                <option value="alpha">Alphabetical (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results summary bar */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-[var(--text-primary)]">{sortedClinics.length}</strong> of{" "}
              {initialClinics.length} clinics
            </span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] font-semibold text-[11px]">
                Matching &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px]">
            <span>{totalDoctors} Registered Doctors</span>
            <span>•</span>
            <span>{totalPatients} Enrolled Patients</span>
          </div>
        </div>
      </div>

      {/* Clinics Card Grid */}
      {sortedClinics.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {sortedClinics.map((clinic) => {
            const hasDoctors = clinic._count.doctors > 0;

            return (
              <div
                key={clinic.id}
                className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/40 transition-all p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md group relative overflow-hidden"
              >
                {/* Subtle top ambient indicator */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--brand-primary)] via-teal-400 to-sky-400 opacity-80" />

                <div className="space-y-5">
                  {/* Card Header: Icon, Name, Badges */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--brand-surface)] to-[var(--bg-subtle)] text-[var(--brand-primary)] border border-[var(--brand-border)] flex items-center justify-center font-black text-lg shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/clinics/${clinic.slug}`}
                            className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug hover:text-[var(--brand-text)] transition"
                          >
                            {clinic.name}
                          </Link>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          ID: {clinic.slug}
                        </p>
                      </div>
                    </div>

                    {/* Status & Plan Badges */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          clinic.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            clinic.status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                          }`}
                        />
                        {clinic.status === "ACTIVE" ? "Active Chamber" : clinic.status}
                      </span>

                      {clinic.plan && (
                        <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] text-[10px] font-bold border border-[var(--brand-border)]/60">
                          {clinic.plan.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Location & Contact Details */}
                  <div className="p-4 rounded-2xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)] space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        {clinic.address || "Clinical Chamber Address Registered on File"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-5 pt-1 border-t border-[var(--border-subtle)]/60">
                      {clinic.contactPhone ? (
                        <a
                          href={`tel:${clinic.contactPhone}`}
                          className="flex items-center gap-1.5 hover:text-[var(--brand-primary)] transition font-medium"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{clinic.contactPhone}</span>
                        </a>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Phone className="w-3.5 h-3.5" />
                          <span>Hotline available upon appointment</span>
                        </span>
                      )}

                      {clinic.contactEmail && (
                        <a
                          href={`mailto:${clinic.contactEmail}`}
                          className="flex items-center gap-1.5 hover:text-[var(--brand-primary)] transition font-medium"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{clinic.contactEmail}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Practicing Physicians / Specialist Roster */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                        <span>Consulting Physicians</span>
                      </span>
                      <span className="text-[11px] font-bold text-[var(--brand-text)]">
                        {clinic._count.doctors} {clinic._count.doctors === 1 ? "Physician" : "Physicians"}
                      </span>
                    </div>

                    {hasDoctors ? (
                      <div className="space-y-2">
                        {clinic.doctors.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {doc.user.imageUrl ? (
                                <Image
                                  src={doc.user.imageUrl}
                                  alt={doc.user.name}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-[var(--border-subtle)]"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold text-xs shrink-0">
                                  {doc.user.name.charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-white truncate">
                                  {doc.user.name}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {doc.specialization} {doc.degrees ? `• ${doc.degrees}` : ""}
                                </p>
                              </div>
                            </div>

                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Available
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)]/50 border border-dashed border-[var(--border-default)] text-xs text-slate-500 flex items-center justify-between gap-2">
                        <span>New chamber hub — actively assigning clinical physicians.</span>
                        <Link
                          href="/auth/register"
                          className="font-bold text-[var(--brand-text)] hover:underline whitespace-nowrap"
                        >
                          Join Clinic →
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Capabilities Tags */}
                  <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-semibold text-slate-500">
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Digital Rx EMR
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[var(--brand-primary)]" />
                      Live Serial Queues
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-sky-500" />
                      BMDC Verified
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-6 mt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 w-full sm:w-auto">
                    <span>Enrolled: </span>
                    <strong className="text-[var(--text-primary)]">
                      {clinic._count.patients} Patients
                    </strong>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      href={`/clinics/${clinic.slug}`}
                      className="px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] hover:border-[var(--brand-primary)] bg-[var(--bg-subtle)] hover:bg-[var(--brand-surface)] text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-[var(--brand-text)] transition flex items-center gap-1.5 justify-center flex-1 sm:flex-initial"
                    >
                      <Users className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                      <span>Clinic Info & Staff</span>
                    </Link>

                    {clinic.contactPhone && (
                      <a
                        href={`tel:${clinic.contactPhone}`}
                        className="px-3 py-2.5 rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 justify-center flex-1 sm:flex-initial"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Hotline</span>
                      </a>
                    )}

                    <Link
                      href={`/doctors?search=${encodeURIComponent(clinic.name)}`}
                      className="px-4 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white hover:opacity-95 text-xs font-bold transition flex items-center gap-1.5 justify-center shadow-xs flex-1 sm:flex-initial"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Doctors & Serial</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty / No Match State */
        <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No matching clinics found
            </h3>
            <p className="text-xs text-slate-500">
              We couldn&apos;t find any clinics matching your current search &ldquo;{searchQuery}&rdquo;.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
            className="px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-90 transition"
          >
            Clear Filters & View All
          </button>
        </div>
      )}

      {/* Onboarding Bottom Callout Banner */}
      <div className="mt-12 rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-[var(--brand-surface)] via-[var(--bg-surface)] to-[var(--bg-subtle)] border border-[var(--brand-border)]/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-text)] text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Your Practice</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Register Your Clinic, Chamber or Polyclinic
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Equip your physicians with automated dosage composition, live chamber TV call tokens, and verified BMDC A4 printouts. 14-day free trial with instant setup.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Link
            href="/auth/register"
            className="px-5 py-3 rounded-2xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs shadow-md transition flex items-center gap-2 whitespace-nowrap"
          >
            <Building2 className="w-4 h-4" />
            <span>Register Clinic (Free Trial)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/auth/login"
            className="px-4 py-3 rounded-2xl border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-slate-700 dark:text-slate-200 font-bold text-xs transition"
          >
            Sign In to EMR
          </Link>
        </div>
      </div>
    </div>
  );
}
