"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Search,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  X,
  BadgeCheck,
} from "lucide-react";

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  imageUrl: string | null;
  role: "STAFF" | "ADMIN" | "DOCTOR";
  createdAt: string | Date;
  organization: {
    id: string;
    name: string;
    slug: string;
    address: string | null;
    contactPhone: string | null;
  } | null;
  doctor?: {
    specialization: string;
    degrees?: string | null;
    designation?: string | null;
    visitingHours?: string | null;
    chamberAddress?: string | null;
    available: boolean;
  } | null;
};

type ClinicOption = {
  id: string;
  name: string;
  slug: string;
};

interface StaffDirectoryProps {
  initialStaff: StaffMember[];
  clinics: ClinicOption[];
}

export function StaffDirectory({ initialStaff, clinics }: StaffDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClinic, setSelectedClinic] = useState<string>("ALL");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"name" | "role" | "clinic">("name");

  const filteredStaff = useMemo(() => {
    return initialStaff.filter((staff) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        staff.name.toLowerCase().includes(q) ||
        staff.email.toLowerCase().includes(q) ||
        (staff.phone && staff.phone.toLowerCase().includes(q)) ||
        (staff.organization && staff.organization.name.toLowerCase().includes(q)) ||
        (staff.doctor && staff.doctor.specialization.toLowerCase().includes(q));

      const matchesClinic =
        selectedClinic === "ALL" ||
        staff.organization?.slug === selectedClinic;

      const matchesRole =
        selectedRole === "ALL" || staff.role === selectedRole;

      return matchesSearch && matchesClinic && matchesRole;
    });
  }, [initialStaff, searchQuery, selectedClinic, selectedRole]);

  const sortedStaff = useMemo(() => {
    const list = [...filteredStaff];
    if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "role") {
      list.sort((a, b) => a.role.localeCompare(b.role));
    } else if (sortBy === "clinic") {
      list.sort((a, b) => {
        const nameA = a.organization?.name || "";
        const nameB = b.organization?.name || "";
        return nameA.localeCompare(nameB);
      });
    }
    return list;
  }, [filteredStaff, sortBy]);

  const getRoleBadge = (role: StaffMember["role"]) => {
    switch (role) {
      case "STAFF":
        return {
          label: "Front Desk & Triage Staff",
          badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
          icon: <ClipboardList className="w-3.5 h-3.5" />,
          department: "Patient Intake & Queue Management",
        };
      case "ADMIN":
        return {
          label: "Clinic Operations Admin",
          badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
          department: "Practice Administration & Governance",
        };
      case "DOCTOR":
        return {
          label: "Consulting Physician",
          badgeClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
          icon: <Stethoscope className="w-3.5 h-3.5" />,
          department: "Clinical Consultations & Prescriptions",
        };
      default:
        return {
          label: role,
          badgeClass: "bg-slate-500/10 text-slate-600 border-slate-500/20",
          icon: <Users className="w-3.5 h-3.5" />,
          department: "Clinical Services",
        };
    }
  };

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
              placeholder="Search staff by name, email, phone, role, or clinic affiliation..."
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

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Clinic Filter */}
            <select
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
              aria-label="Filter staff by clinic"
              className="px-3.5 py-2.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
            >
              <option value="ALL">All Clinics & Chambers</option>
              {clinics.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              aria-label="Filter staff by role"
              className="px-3.5 py-2.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="STAFF">Front Desk & Triage (STAFF)</option>
              <option value="ADMIN">Clinic Administration (ADMIN)</option>
              <option value="DOCTOR">Consulting Physicians (DOCTOR)</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "role" | "clinic")}
              aria-label="Sort staff members"
              className="px-3.5 py-2.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
            >
              <option value="name">Sort by Name (A-Z)</option>
              <option value="role">Sort by Role</option>
              <option value="clinic">Sort by Clinic</option>
            </select>
          </div>
        </div>

        {/* Results summary bar */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-[var(--text-primary)]">{sortedStaff.length}</strong> of{" "}
              {initialStaff.length} healthcare team members
            </span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] font-semibold text-[11px]">
                Matching &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px]">
            <span>{clinics.length} Accredited Facilities</span>
          </div>
        </div>
      </div>

      {/* Staff Card Grid */}
      {sortedStaff.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {sortedStaff.map((member) => {
            const roleInfo = getRoleBadge(member.role);

            return (
              <div
                key={member.id}
                className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/40 transition-all p-6 flex flex-col justify-between shadow-xs hover:shadow-md group relative overflow-hidden"
              >
                {/* Top Subtle Ambient Indicator */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--brand-primary)] via-teal-400 to-sky-400 opacity-80" />

                <div className="space-y-4">
                  {/* Top Header: Avatar & Role */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {member.imageUrl ? (
                        <Image
                          src={member.imageUrl}
                          alt={member.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-[var(--border-subtle)] ring-2 ring-[var(--brand-border)]/40"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--brand-surface)] to-[var(--bg-subtle)] text-[var(--brand-primary)] border border-[var(--brand-border)] flex items-center justify-center font-black text-base shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          {member.name.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight truncate">
                            {member.name}
                          </h3>
                          <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {member.doctor?.designation || roleInfo.department}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Role Badge & Department Details */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border ${roleInfo.badgeClass}`}
                    >
                      {roleInfo.icon}
                      <span>{roleInfo.label}</span>
                    </span>

                    {member.doctor?.specialization && (
                      <span className="px-2 py-0.5 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] text-[10px] font-bold border border-[var(--brand-border)]">
                        {member.doctor.specialization}
                      </span>
                    )}
                  </div>

                  {/* Clinic Affiliation Card */}
                  {member.organization ? (
                    <Link
                      href={`/clinics/${member.organization.slug}`}
                      className="p-3 rounded-2xl bg-[var(--bg-subtle)]/70 hover:bg-[var(--brand-surface)]/60 border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition flex items-center justify-between gap-3 text-xs group/clinic block"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Building2 className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200 group-hover/clinic:text-[var(--brand-text)] truncate">
                          {member.organization.name}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/clinic:translate-x-0.5 group-hover/clinic:text-[var(--brand-text)] transition-transform shrink-0" />
                    </Link>
                  ) : (
                    <div className="p-3 rounded-2xl bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)] text-xs text-slate-400 flex items-center gap-2">
                      <Building2 className="w-4 h-4 shrink-0" />
                      <span>Platform Staff & Support</span>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a
                        href={`mailto:${member.email}`}
                        className="hover:text-[var(--brand-primary)] transition truncate"
                      >
                        {member.email}
                      </a>
                    </div>

                    {member.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a
                          href={`tel:${member.phone}`}
                          className="hover:text-[var(--brand-primary)] transition"
                        >
                          {member.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-5 mt-5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </div>

                  {member.organization ? (
                    <Link
                      href={`/clinics/${member.organization.slug}`}
                      className="px-3.5 py-1.5 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] hover:bg-[var(--brand-primary)] hover:text-white border border-[var(--brand-border)] text-xs font-bold transition flex items-center gap-1"
                    >
                      <span>Clinic Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <Link
                      href="/clinics"
                      className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs text-slate-500 font-semibold"
                    >
                      View Clinics
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty / No Match State */
        <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No staff members found
            </h3>
            <p className="text-xs text-slate-500">
              No clinical staff or administrators matched your current search filters.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedClinic("ALL");
              setSelectedRole("ALL");
            }}
            className="px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-90 transition"
          >
            Clear Filters & View All
          </button>
        </div>
      )}
    </div>
  );
}
