"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { CustomSelect } from "@/components/common/custom-select";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  imageUrl?: string | null;
  role: {
    name: string;
  };
  doctor?: {
    specialization?: string | null;
  } | null;
  patient?: unknown;
  createdAt: string;
}

const inputClasses =
  "w-full px-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]";

export function UserManager() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createRole, setCreateRole] = useState("DOCTOR");
  const [createSpecialization, setCreateSpecialization] = useState("General Medicine");
  const [createDegrees, setCreateDegrees] = useState("MBBS");
  const [createBmdcRegNo, setCreateBmdcRegNo] = useState("");
  const [createChamberAddress, setCreateChamberAddress] = useState("Room 301, 3rd Floor");
  const [createVisitingHours, setCreateVisitingHours] = useState("09:00 AM - 01:00 PM");
  const [createError, setCreateError] = useState("");

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editError, setEditError] = useState("");

  const fetchUsers = useCallback(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setUsers(data.data);
        }
      })
      .catch(() => {
        console.error("Failed to load users");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setCreateName("");
    setCreateEmail("");
    setCreatePassword("");
    setCreatePhone("");
    setCreateRole("DOCTOR");
    setCreateError("");
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim() || !createEmail.trim() || !createPassword.trim()) {
      setCreateError("Name, email, and password are required.");
      return;
    }
    setCreateError("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: createName.trim(),
            email: createEmail.trim().toLowerCase(),
            password: createPassword,
            phone: createPhone.trim() || undefined,
            role: createRole,
            specialization: createRole === "DOCTOR" ? createSpecialization : undefined,
            degrees: createRole === "DOCTOR" ? createDegrees : undefined,
            bmdcRegNo: createRole === "DOCTOR" ? createBmdcRegNo : undefined,
            chamberAddress: createRole === "DOCTOR" ? createChamberAddress : undefined,
            visitingHours: createRole === "DOCTOR" ? createVisitingHours : undefined,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setShowCreateModal(false);
          await fetchUsers();
        } else {
          setCreateError(data.error || data.message || "Failed to create user account.");
        }
      } catch {
        setCreateError("Network error occurred. Please try again.");
      }
    });
  };

  const handleOpenEdit = (user: UserRecord) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || "");
    setEditRole(user.role.name);
    setEditPassword("");
    setEditError("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim() || !editEmail.trim()) {
      setEditError("Name and email are required.");
      return;
    }
    setEditError("");

    startTransition(async () => {
      try {
        const payload: Record<string, string> = {
          name: editName.trim(),
          email: editEmail.trim().toLowerCase(),
          role: editRole,
        };
        if (editPhone.trim()) payload.phone = editPhone.trim();
        if (editPassword.trim()) payload.password = editPassword.trim();

        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success) {
          setEditingUser(null);
          await fetchUsers();
        } else {
          setEditError(data.error || data.message || "Failed to update user.");
        }
      } catch {
        setEditError("Network error occurred.");
      }
    });
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (currentUser?.id === id) {
      alert("You cannot delete your own active administrative account.");
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete account "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert(data.error || data.message || "Failed to delete user");
      }
    } catch {
      alert("Network error occurred while deleting user.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));
    const matchesRole = roleFilter === "ALL" || u.role.name === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeStyle = (roleName: string) => {
    switch (roleName) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "ADMIN":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      case "DOCTOR":
        return "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800";
      case "STAFF":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      default:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    }
  };

  const stats = {
    total: users.length,
    doctors: users.filter((u) => u.role.name === "DOCTOR").length,
    staff: users.filter((u) => u.role.name === "STAFF").length,
    patients: users.filter((u) => u.role.name === "PATIENT").length,
    admins: users.filter((u) => u.role.name === "SUPER_ADMIN" || u.role.name === "ADMIN").length,
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 text-xs font-bold">
              User Directory & Credentials
            </span>
            <span className="text-xs text-slate-400 font-medium">• Access Management</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hospital Account Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full administrative control to provision, update, and audit clinical and administrative staff accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer self-start md:self-auto shrink-0"
        >
          <span>➕</span>
          <span>Register New Account</span>
        </button>
      </div>

      {/* Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Accounts", count: stats.total, icon: "👥" },
          { label: "Doctors", count: stats.doctors, icon: "🩺" },
          { label: "Hospital Staff", count: stats.staff, icon: "🏥" },
          { label: "Patients", count: stats.patients, icon: "🧑" },
          { label: "Administrators", count: stats.admins, icon: "👑" },
        ].map((item) => (
          <div
            key={item.label}
            className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-2xs flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {item.label}
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {item.count}
              </p>
            </div>
            <span className="text-2xl">{item.icon}</span>
          </div>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 rounded-xl text-sm bg-[var(--bg-surface)] border border-[var(--border-default)] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 text-slate-900 dark:text-slate-100 min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]"
          />
          <span className="absolute left-3 top-3.5 text-xs text-slate-400">🔍</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {["ALL", "ADMIN", "DOCTOR", "STAFF", "PATIENT", ...(currentUser?.role === "SUPER_ADMIN" ? ["SUPER_ADMIN"] : [])].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                roleFilter === role
                  ? "bg-[var(--brand-primary)] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {role === "ALL" ? "All Roles" : role.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* User Table / Cards */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading user accounts...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No accounts match your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">User / Name</th>
                  <th className="py-3.5 px-5">Email Address</th>
                  <th className="py-3.5 px-5">Contact Phone</th>
                  <th className="py-3.5 px-5">Assigned Role</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold text-xs uppercase border border-[var(--brand-border)]">
                        {u.name.slice(0, 2)}
                      </div>
                      <div>
                        <span>{u.name}</span>
                        {u.doctor?.specialization && (
                          <span className="block text-[10px] font-normal text-slate-400">
                            {u.doctor.specialization}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3.5 px-5 text-slate-500">{u.phone || "—"}</td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeStyle(
                          u.role.name
                        )}`}
                      >
                        {u.role.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        title="Edit Account"
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition cursor-pointer"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        title="Delete Account"
                        disabled={currentUser?.id === u.id}
                        className="px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 font-semibold text-[11px] transition disabled:opacity-40 cursor-pointer"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-surface)] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Register New User Account
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Salma Begum"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="salma.begum@hospital.com"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Min 8 characters"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+880 1711..."
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  System Access Role *
                </label>
                <CustomSelect
                  value={createRole}
                  onChange={(val) => setCreateRole(val)}
                  options={
                    currentUser?.role === "SUPER_ADMIN"
                      ? [
                          { value: "DOCTOR", label: "DOCTOR (Physician & Chamber Practitioner)", badge: "Physician" },
                          { value: "STAFF", label: "STAFF (Hospital Front Desk & Queue Operator)", badge: "Front Desk" },
                          { value: "PATIENT", label: "PATIENT (Patient Portal Access)", badge: "Patient" },
                          { value: "ADMIN", label: "ADMIN (Clinic Administrator)", badge: "Admin" },
                          { value: "SUPER_ADMIN", label: "SUPER_ADMIN (Hospital Network Executive)", badge: "Executive" },
                        ]
                      : [
                          { value: "DOCTOR", label: "DOCTOR (Physician & Chamber Practitioner)", badge: "Physician" },
                          { value: "STAFF", label: "STAFF (Hospital Front Desk & Queue Operator)", badge: "Front Desk" },
                          { value: "PATIENT", label: "PATIENT (Patient Portal Access)", badge: "Patient" },
                          { value: "ADMIN", label: "ADMIN (Clinic Administrator)", badge: "Admin" },
                        ]
                  }
                  searchable={false}
                />
              </div>

              {createRole === "DOCTOR" && (
                <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-text)] block">
                    Physician Credentials & Chamber Roster
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Specialization
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cardiology"
                        value={createSpecialization}
                        onChange={(e) => setCreateSpecialization(e.target.value)}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Degrees / Qualifications
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MBBS, FCPS, MD"
                        value={createDegrees}
                        onChange={(e) => setCreateDegrees(e.target.value)}
                        className={inputClasses}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        BMDC Reg No
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BMDC-A-41285"
                        value={createBmdcRegNo}
                        onChange={(e) => setCreateBmdcRegNo(e.target.value)}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Visiting Hours
                      </label>
                      <input
                        type="text"
                        placeholder="09:00 AM - 01:00 PM"
                        value={createVisitingHours}
                        onChange={(e) => setCreateVisitingHours(e.target.value)}
                        className={inputClasses}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Chamber Address & Room
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Room 301, 3rd Floor"
                      value={createChamberAddress}
                      onChange={(e) => setCreateChamberAddress(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                </div>
              )}

              {createError && (
                <p className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 dark:text-red-400 text-xs font-medium">
                  {createError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--brand-primary)] text-white shadow-md hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Creating..." : "Save Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-surface)] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Edit User Account
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Change Password (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  System Access Role *
                </label>
                <CustomSelect
                  value={editRole}
                  onChange={(val) => setEditRole(val)}
                  options={
                    currentUser?.role === "SUPER_ADMIN"
                      ? [
                          { value: "DOCTOR", label: "DOCTOR", badge: "Physician" },
                          { value: "STAFF", label: "STAFF", badge: "Front Desk" },
                          { value: "PATIENT", label: "PATIENT", badge: "Patient" },
                          { value: "ADMIN", label: "ADMIN", badge: "Admin" },
                          { value: "SUPER_ADMIN", label: "SUPER_ADMIN", badge: "Executive" },
                        ]
                      : [
                          { value: "DOCTOR", label: "DOCTOR", badge: "Physician" },
                          { value: "STAFF", label: "STAFF", badge: "Front Desk" },
                          { value: "PATIENT", label: "PATIENT", badge: "Patient" },
                          { value: "ADMIN", label: "ADMIN", badge: "Admin" },
                        ]
                  }
                  searchable={false}
                />
              </div>

              {editError && (
                <p className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 dark:text-red-400 text-xs font-medium">
                  {editError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--brand-primary)] text-white shadow-md hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Updating..." : "Update Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
