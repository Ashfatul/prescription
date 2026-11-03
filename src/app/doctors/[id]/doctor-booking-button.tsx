"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { AppointmentBookingModal } from "@/components/appointments/appointment-booking-modal";

export function DoctorBookingButton({
  doctorId,
  doctorName,
}: {
  doctorId: string;
  doctorName: string;
}) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isStaffOrDoctor = user && (user.role === "DOCTOR" || user.role === "STAFF" || user.role === "SUPER_ADMIN");
  const [isOpen, setIsOpen] = useState(false);

  if (isStaffOrDoctor) {
    return (
      <div className="w-full py-2.5 px-4 rounded-2xl bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)] text-xs font-semibold text-center">
        <span>{language === "bn" ? `${user?.role} হিসেবে লগইন আছেন (${t.bookingDisabledRole})` : `Logged in as ${user?.role} (${t.bookingDisabledRole})`}</span>
      </div>
    );
  }

  const shortDoctorName = doctorName.split(" ")[0] || (t("roleDoctor"));

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold hover:opacity-90 transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
      >
        <Calendar className="w-4 h-4" />
        <span>{t.bookConsultationWith} {shortDoctorName}</span>
      </button>

      <AppointmentBookingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialDoctorId={doctorId}
      />
    </>
  );
}
