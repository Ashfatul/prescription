"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Users,
  Clock,
  Printer,
  XCircle,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Activity,
  HeartPulse,
  CreditCard,
  ShieldCheck,
  DollarSign,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Check,
  Stethoscope,
  Phone,
  Mail,
  Loader2,
  FileText,
  Upload,
} from "lucide-react";
import { PublicDoctorItem, FeeBreakdown } from "@/components/appointments/appointment-booking-modal";
import { CustomSelect } from "@/components/common/custom-select";
import {
  ClinicalIntakeForm,
  ClinicalIntakeData,
} from "@/components/appointments/clinical-intake-form";
import { evaluateDoctorSchedule, ScheduleData } from "@/lib/doctor-schedule";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";

const inputClasses =
  "w-full px-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]";

interface PatientRecord {
  id: string;
  userId: string;
  gender?: string | null;
  medicalHistory?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    isApproved?: boolean;
    approvedAt?: string | null;
    approvedBy?: string | null;
  };
}

export interface AppointmentRecord {
  id: string;
  serialNumber: number;
  appointmentDate: string;
  status: "PENDING" | "CONFIRMED" | "BOOKED" | "COMPLETED" | "CANCELLED";
  notes?: string | null;
  visitType?: string | null;
  fee?: number | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  refundStatus?: string | null;
  refundAmount?: number | null;
  refundReason?: string | null;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  cancelledByRole?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  verificationNotes?: string | null;
  diseasesJson?: string[] | null;
  allergiesJson?: string[] | null;
  medicalFlagsJson?: string[] | null;
  dietRequired?: boolean | null;
  dietInstructionsJson?: string[] | null;
  dietNotes?: string | null;
  doctor: {
    id: string;
    specialization: string;
    chamberAddress?: string | null;
    visitingHours?: string | null;
    scheduleJson?: unknown;
    available?: boolean;
    cancellationWindowHours?: number | null;
    user: {
      name: string;
    };
  };
  patient: {
    id: string;
    gender?: string | null;
    medicalHistory?: string | null;
    user: {
      name: string;
      phone?: string | null;
      email: string;
    };
  };
}

interface ReceptionManagerProps {
  initialTab?: "verifications" | "checkin" | "queue" | "appointments" | "patients";
}

export function ReceptionManager({ initialTab = "verifications" }: ReceptionManagerProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  // Navigation tabs within Reception
  const [activeTab, setActiveTab] = useState<
    "verifications" | "checkin" | "queue" | "appointments" | "patients"
  >(initialTab);

  // Dependencies
  const [doctors, setDoctors] = useState<PublicDoctorItem[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Verification & Action States
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [markingPaymentId, setMarkingPaymentId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Staff Cancellation Modal State
  const [staffCancelTarget, setStaffCancelTarget] = useState<AppointmentRecord | null>(null);
  const [staffCancelReason, setStaffCancelReason] = useState("");
  const [staffRefundChoice, setStaffRefundChoice] = useState<"FULL" | "NONE" | "CUSTOM">("FULL");
  const [staffRefundAmount, setStaffRefundAmount] = useState<number>(0);
  const [staffCancelSubmitting, setStaffCancelSubmitting] = useState(false);

  // Staff Diagnostic Lab Report Upload State (Requirement 12 & 13)
  const [uploadReportModalOpen, setUploadReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    patientId: string;
    patientName: string;
    doctorId?: string;
  } | null>(null);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const openReportUploadModal = (patientId: string, patientName: string, doctorId?: string) => {
    setReportTarget({ patientId, patientName, doctorId });
    setReportTitle("");
    setReportDescription("");
    setReportNotes("");
    setReportFile(null);
    setReportError(null);
    setUploadReportModalOpen(true);
  };

  const handleUploadTestReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget || !reportFile || !reportTitle.trim()) {
      setReportError("Please enter a report title and select a document file (PDF or Image).");
      return;
    }
    setUploadingReport(true);
    setReportError(null);

    try {
      const formData = new FormData();
      formData.append("file", reportFile);
      const fileRes = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });
      const fileData = await fileRes.json();
      if (!fileRes.ok || !fileData.success) {
        throw new Error(fileData.message || "Failed to upload document file");
      }

      const reportRes = await fetch("/api/test-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: reportTitle.trim(),
          description: reportDescription.trim() || undefined,
          fileUrl: fileData.data.url,
          fileType: fileData.data.fileType,
          originalName: fileData.data.originalName || reportFile.name,
          patientId: reportTarget.patientId,
          doctorId: reportTarget.doctorId || undefined,
          status: "PENDING",
          notes: reportNotes.trim() || undefined,
        }),
      });
      const reportData = await reportRes.json();
      if (!reportRes.ok || !reportData.success) {
        throw new Error(reportData.message || "Failed to create diagnostic test report record");
      }

      showToast(`Diagnostic report "${reportTitle.trim()}" successfully attached for ${reportTarget.patientName}! Ready for Doctor's inspection.`, "success");
      setUploadReportModalOpen(false);
      setReportTarget(null);
      setReportTitle("");
      setReportDescription("");
      setReportNotes("");
      setReportFile(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload test report";
      setReportError(msg);
    } finally {
      setUploadingReport(false);
    }
  };

  // Patient Verification State
  const [patientFilter, setPatientFilter] = useState<"ALL" | "PENDING" | "VERIFIED">("ALL");
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [verifyingPatientId, setVerifyingPatientId] = useState<string | null>(null);
  const [patientVerifySuccess, setPatientVerifySuccess] = useState<string | null>(null);

  const handleVerifyPatient = async (patientId: string, patientName: string) => {
    setVerifyingPatientId(patientId);
    setPatientVerifySuccess(null);
    try {
      const res = await fetch(`/api/patients/${patientId}/verify`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPatients((prev) =>
          prev.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  user: {
                    ...p.user,
                    isApproved: true,
                    approvedAt: new Date().toISOString(),
                    approvedBy: "Clinic Staff",
                  },
                }
              : p
          )
        );
        setPatientVerifySuccess(`Patient "${patientName}" has been successfully verified & activated! Confirmation email sent.`);
      } else {
        alert(data.message || "Failed to verify patient");
      }
    } catch {
      alert("Network error verifying patient");
    } finally {
      setVerifyingPatientId(null);
    }
  };

  // Check-in Form State
  const [patientMode, setPatientMode] = useState<"walkin" | "existing">("walkin");
  const [searchPatientQuery, setSearchPatientQuery] = useState("");
  const [selectedExistingPatientId, setSelectedExistingPatientId] = useState("");

  // Walk-in fields
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [walkinGender, setWalkinGender] = useState("Male");
  const [walkinAge, setWalkinAge] = useState("");
  const [walkinHistory, setWalkinHistory] = useState("");

  // Triage vitals
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [bp, setBp] = useState("120/80 mmHg");
  const [pulse, setPulse] = useState("76 bpm");
  const [temp, setTemp] = useState("98.6 °F");
  const [weight, setWeight] = useState("");
  const [complaint, setComplaint] = useState("");

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [issuedTicket, setIssuedTicket] = useState<AppointmentRecord | null>(null);

  // Clinical Intake State
  const [intake, setIntake] = useState<ClinicalIntakeData>({
    diseases: [],
    allergies: [],
    medicalFlags: [],
    dietRequired: false,
    dietInstructions: [],
    dietNotes: "",
  });

  // Reception Payment & Fee State
  const [staffFeeBreakdown, setStaffFeeBreakdown] = useState<FeeBreakdown | null>(null);
  const [staffVisitType, setStaffVisitType] = useState<"NEW" | "FOLLOWUP" | "REPORT_REVIEW">("NEW");
  const [staffPaymentMethod, setStaffPaymentMethod] = useState<"CASH" | "CARD_POS" | "WAIVED">("CASH");

  // Filters
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [queueSearch, setQueueSearch] = useState("");
  const [allApptsStatusFilter, setAllApptsStatusFilter] = useState<
    "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  >("ALL");

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctorId);
  }, [doctors, selectedDoctorId]);

  const staffEffectiveBreakdown: FeeBreakdown | null = useMemo(() => {
    if (staffFeeBreakdown) return staffFeeBreakdown;
    if (!selectedDoctor) return null;
    return {
      visitType: "NEW",
      fee: selectedDoctor.newPatientFee ?? 50,
      isFreeReportReview: false,
      followupEligible: false,
      newPatientFee: selectedDoctor.newPatientFee ?? 50,
      followupFee: selectedDoctor.followupFee ?? 30,
      followupValidityDays: selectedDoctor.followupValidityDays ?? 90,
      reportFreeDays: selectedDoctor.reportFreeDays ?? 2,
      reason: `Consultation fee schedule for ${selectedDoctor.name}.`,
    };
  }, [staffFeeBreakdown, selectedDoctor]);

  // Real-time fee checking for staff
  useEffect(() => {
    if (!selectedDoctorId) return;
    const patId = patientMode === "existing" ? selectedExistingPatientId : undefined;
    const url = patId
      ? `/api/appointments/fee-check?doctorId=${selectedDoctorId}&patientId=${patId}`
      : `/api/appointments/fee-check?doctorId=${selectedDoctorId}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setStaffFeeBreakdown(data.data);
          setStaffVisitType(data.data.visitType);
        }
      })
      .catch((err) => console.error("Failed to fetch staff fee check:", err));
  }, [selectedDoctorId, selectedExistingPatientId, patientMode]);

  // Reusable refresh function
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const docUrl = user?.organizationId
        ? `/api/public/doctors?organizationId=${user.organizationId}`
        : "/api/public/doctors";

      const [docRes, patRes, apptRes] = await Promise.all([
        fetch(docUrl),
        fetch("/api/patients"),
        fetch("/api/appointments"),
      ]);

      const [docData, patData, apptData] = await Promise.all([
        docRes.json(),
        patRes.json(),
        apptRes.json(),
      ]);

      if (docData.success && Array.isArray(docData.data)) {
        setDoctors(docData.data);
      }

      if (patData.success && Array.isArray(patData.data)) {
        setPatients(patData.data);
      }

      if (apptData.success && Array.isArray(apptData.data)) {
        setAppointments(apptData.data);
      }
    } catch (err) {
      console.error("Failed to refresh reception data", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    let active = true;

    async function initFetch() {
      try {
        const docUrl = user?.organizationId
          ? `/api/public/doctors?organizationId=${user.organizationId}`
          : "/api/public/doctors";

        const [docRes, patRes, apptRes] = await Promise.all([
          fetch(docUrl),
          fetch("/api/patients"),
          fetch("/api/appointments"),
        ]);

        const [docData, patData, apptData] = await Promise.all([
          docRes.json(),
          patRes.json(),
          apptRes.json(),
        ]);

        if (!active) return;

        if (docData.success && Array.isArray(docData.data)) {
          setDoctors(docData.data);
          if (docData.data.length > 0) {
            setSelectedDoctorId((prev) => prev || docData.data[0].id);
          }
        }

        if (patData.success && Array.isArray(patData.data)) {
          setPatients(patData.data);
        }

        if (apptData.success && Array.isArray(apptData.data)) {
          setAppointments(apptData.data);
        }
      } catch (err) {
        console.error("Failed to load reception desk data", err);
      }
    }

    void initFetch();

    return () => {
      active = false;
    };
  }, [user]);

  // Filtered patients for search in existing mode
  const filteredExistingPatients = useMemo(() => {
    if (!searchPatientQuery.trim()) return patients.slice(0, 8);
    const q = searchPatientQuery.toLowerCase();
    return patients.filter(
      (p) =>
        p.user.name.toLowerCase().includes(q) ||
        (p.user.phone && p.user.phone.toLowerCase().includes(q)) ||
        p.user.email.toLowerCase().includes(q)
    );
  }, [patients, searchPatientQuery]);

  // Pending Verifications List
  const pendingAppointments = useMemo(() => {
    return appointments.filter((a) => a.status === "PENDING");
  }, [appointments]);

  const filteredPendingAppointments = useMemo(() => {
    return pendingAppointments.filter((a) => {
      const matchesDoc = doctorFilter === "all" || a.doctor.id === doctorFilter;
      const matchesQuery =
        !queueSearch.trim() ||
        a.patient.user.name.toLowerCase().includes(queueSearch.toLowerCase()) ||
        (a.patient.user.phone && a.patient.user.phone.includes(queueSearch)) ||
        String(a.serialNumber).includes(queueSearch);

      return matchesDoc && matchesQuery;
    });
  }, [pendingAppointments, doctorFilter, queueSearch]);

  // Today's Confirmed Queue appointments
  const todayAppointments = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return appointments.filter((a) => {
      const aDate = new Date(a.appointmentDate).toISOString().split("T")[0];
      const matchesDate = aDate === today;
      const matchesDoc = doctorFilter === "all" || a.doctor.id === doctorFilter;
      const matchesQuery =
        !queueSearch.trim() ||
        a.patient.user.name.toLowerCase().includes(queueSearch.toLowerCase()) ||
        String(a.serialNumber).includes(queueSearch);

      // Only show confirmed/booked/completed in the active consultation queue (unverified pending stay in verification queue)
      const isActiveInQueue =
        a.status === "CONFIRMED" || a.status === "BOOKED" || a.status === "COMPLETED";

      return matchesDate && matchesDoc && matchesQuery && isActiveInQueue;
    });
  }, [appointments, doctorFilter, queueSearch]);

  // All Appointments filtered for the history/cancellations tab
  const filteredAllAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const matchesDoc = doctorFilter === "all" || a.doctor.id === doctorFilter;
      const matchesQuery =
        !queueSearch.trim() ||
        a.patient.user.name.toLowerCase().includes(queueSearch.toLowerCase()) ||
        (a.patient.user.phone && a.patient.user.phone.includes(queueSearch)) ||
        String(a.serialNumber).includes(queueSearch);

      const matchesStatus =
        allApptsStatusFilter === "ALL"
          ? true
          : allApptsStatusFilter === "CONFIRMED"
          ? a.status === "CONFIRMED" || a.status === "BOOKED"
          : a.status === allApptsStatusFilter;

      return matchesDoc && matchesQuery && matchesStatus;
    });
  }, [appointments, doctorFilter, queueSearch, allApptsStatusFilter]);

  // Action: Confirm and Activate Appointment (mark as simple active)
  const handleConfirmAppointment = async (id: string, notes?: string) => {
    setConfirmingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationNotes: notes || "Doctor availability, timing, and fee verified by clinic reception",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to confirm appointment");
      }

      showToast(
        `Appointment #${json.data.serialNumber} verified & activated! Patient added to Dr. ${json.data.doctor.user.name}'s chamber queue.`,
        "success"
      );
      void loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error confirming appointment";
      showToast(msg, "error");
    } finally {
      setConfirmingId(null);
    }
  };

  // Action: Mark Payment Collected & Confirm simultaneously
  const handleCollectPaymentAndConfirm = async (
    id: string,
    method: "CASH" | "CARD_POS" | "WAIVED"
  ) => {
    setMarkingPaymentId(id);
    try {
      // 1. Update Payment status
      const payRes = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: method === "WAIVED" ? "WAIVED" : "PAID",
          paymentMethod: method,
        }),
      });

      const payJson = await payRes.json();
      if (!payRes.ok || !payJson.success) {
        throw new Error(payJson.message || "Failed to record payment");
      }

      // 2. Confirm & activate
      const confirmRes = await fetch(`/api/appointments/${id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationNotes: `Fee collected at front desk via ${method}. Verified and activated.`,
        }),
      });

      const confirmJson = await confirmRes.json();
      if (!confirmRes.ok || !confirmJson.success) {
        throw new Error(confirmJson.message || "Failed to activate appointment");
      }

      showToast(
        `Payment recorded (${method}) & Serial #${confirmJson.data.serialNumber} activated for Dr. ${confirmJson.data.doctor.user.name}!`,
        "success"
      );
      void loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error processing payment & activation";
      showToast(msg, "error");
    } finally {
      setMarkingPaymentId(null);
    }
  };

  // Action: Mark just payment collected
  const handleMarkPaymentOnly = async (
    id: string,
    method: "CASH" | "CARD_POS" | "WAIVED"
  ) => {
    setMarkingPaymentId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: method === "WAIVED" ? "WAIVED" : "PAID",
          paymentMethod: method,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update payment");
      }
      showToast(`Fee marked as PAID via ${method} at front desk.`, "success");
      void loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating payment";
      showToast(msg, "error");
    } finally {
      setMarkingPaymentId(null);
    }
  };

  // Staff Cancellation Submission
  const handleOpenStaffCancel = (appt: AppointmentRecord) => {
    setStaffCancelTarget(appt);
    setStaffCancelReason("Physician Emergency / Chamber Reschedule");
    setStaffRefundChoice("FULL");
    setStaffRefundAmount(appt.fee ?? 0);
  };

  const handleStaffConfirmCancel = async () => {
    if (!staffCancelTarget) return;

    setStaffCancelSubmitting(true);
    try {
      const res = await fetch(`/api/appointments/${staffCancelTarget.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: staffCancelReason.trim() || undefined,
          refundChoice: staffRefundChoice,
          refundAmount: staffRefundChoice === "CUSTOM" ? staffRefundAmount : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel appointment");
      }

      showToast(
        `Appointment #${staffCancelTarget.serialNumber} cancelled.${
          data.data?.refundStatus === "REFUNDED"
            ? ` Full refund of $${data.data?.refundAmount ?? staffCancelTarget.fee} processed.`
            : ""
        }`,
        "info"
      );
      setStaffCancelTarget(null);
      void loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error cancelling appointment";
      showToast(msg, "error");
    } finally {
      setStaffCancelSubmitting(false);
    }
  };

  // Fast Check-In Form Submit (Immediate Confirmation / Done)
  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setErrorMsg("Please select a consulting doctor.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      let patientId = selectedExistingPatientId;

      // 1. If Walk-in, register patient record first
      if (patientMode === "walkin") {
        if (!walkinName.trim()) {
          throw new Error("Patient name is required for walk-in registration.");
        }

        const patRes = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: walkinName.trim(),
            phone: walkinPhone.trim() || undefined,
            gender: walkinGender,
            medicalHistory: walkinHistory.trim()
              ? `Age: ${walkinAge || "N/A"} | History: ${walkinHistory.trim()}`
              : walkinAge
              ? `Age: ${walkinAge}`
              : undefined,
          }),
        });

        const patJson = await patRes.json();
        if (!patRes.ok || !patJson.success) {
          throw new Error(patJson.message || "Failed to register walk-in patient");
        }

        patientId = patJson.data.id;
      }

      if (!patientId) {
        throw new Error("Please select or register a patient.");
      }

      // 2. Prepare notes bundle with Triage Vitals
      const triageNotes = [
        complaint.trim() ? `Complaint: ${complaint.trim()}` : null,
        `Vitals - BP: ${bp || "N/A"}, Pulse: ${pulse || "N/A"}, Temp: ${temp || "N/A"}, Wt: ${weight || "N/A"}`,
      ]
        .filter(Boolean)
        .join(" | ");

      // 3. Issue Appointment Serial Ticket with Clinical Intake & Payment
      const todayIso = new Date().toISOString();
      const chosenFee =
        staffVisitType === "REPORT_REVIEW"
          ? 0
          : staffVisitType === "FOLLOWUP"
          ? staffEffectiveBreakdown?.followupFee ?? selectedDoctor?.followupFee ?? 30
          : staffEffectiveBreakdown?.newPatientFee ?? selectedDoctor?.newPatientFee ?? 50;

      // Staff creation marks as CONFIRMED directly ("thats done")
      const apptRes = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          patientId,
          appointmentDate: todayIso,
          notes: triageNotes,
          visitType: staffVisitType,
          fee: chosenFee,
          paymentMethod: chosenFee === 0 ? "WAIVED" : staffPaymentMethod,
          paymentStatus: chosenFee === 0 ? "WAIVED" : "PAID",
          previousPrescriptionId: staffEffectiveBreakdown?.previousPrescriptionId || undefined,
          diseases: intake.diseases,
          allergies: intake.allergies,
          medicalFlags: intake.medicalFlags,
          dietRequired: intake.dietRequired,
          dietInstructions: intake.dietInstructions,
          dietNotes: intake.dietNotes,
        }),
      });

      const apptJson = await apptRes.json();
      if (!apptRes.ok || !apptJson.success) {
        throw new Error(apptJson.message || "Failed to issue queue serial ticket");
      }

      setIssuedTicket(apptJson.data);
      showToast(
        `Walk-in serial #${apptJson.data.serialNumber} issued and confirmed directly!`,
        "success"
      );

      // Reset form
      setWalkinName("");
      setWalkinPhone("");
      setWalkinAge("");
      setWalkinHistory("");
      setComplaint("");
      setIntake({
        diseases: [],
        allergies: [],
        medicalFlags: [],
        dietRequired: false,
        dietInstructions: [],
        dietNotes: "",
      });
      void loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error during patient check-in";
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: "COMPLETED" | "CANCELLED") => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`Appointment status updated to ${status}`, "info");
        void loadData();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-lg animate-in slide-in-from-top-3 duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-100"
              : toastMessage.type === "error"
              ? "bg-rose-500/15 border-rose-500 text-rose-900 dark:text-rose-100"
              : "bg-blue-500/15 border-blue-500 text-blue-900 dark:text-blue-100"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : toastMessage.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <XCircle className="w-4 h-4 opacity-70" />
          </button>
        </div>
      )}

      {/* Top Banner & Quick Counters */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            {t("uiClinicVerificationFrontDeskOperations")}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 leading-tight">
            {t.receptionTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {t.receptionSubtitle}
          </p>
        </div>

        {/* Quick Stats Chips */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("verifications")}
            className={`px-4 py-2.5 rounded-2xl border text-xs text-left transition cursor-pointer ${
              pendingAppointments.length > 0
                ? "bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20"
                : "bg-[var(--bg-app)] border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400"
            }`}
          >
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">
              {t("pendingVerification")}
            </span>
            <span
              className={`text-base font-extrabold flex items-center gap-1.5 ${
                pendingAppointments.length > 0 ? "text-amber-600 dark:text-amber-400" : ""
              }`}
            >
              {pendingAppointments.length}
              {pendingAppointments.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("queue")}
            className="px-4 py-2.5 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 text-xs text-left hover:border-[var(--brand-primary)] transition cursor-pointer"
          >
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">
              {t("uiActiveQueueToday")}
            </span>
            <span className="text-base font-extrabold text-[var(--brand-text)]">
              {todayAppointments.length}
            </span>
          </button>

          <div className="px-4 py-2.5 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 text-xs text-left">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">
              {t("uiActivePhysicians")}
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {doctors.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            title={t("uiRefreshAllRecords")}
            className="p-3 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Reception Nav Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-xs max-w-fit overflow-x-auto">
        {[
          {
            id: "verifications",
            label: t("uiVerifyConfirm"),
            icon: ShieldCheck,
            badge: pendingAppointments.length > 0 ? pendingAppointments.length : undefined,
          },
          { id: "checkin", label: t.walkInCheckIn, icon: Plus },
          { id: "queue", label: t("uiTodaySLiveQueueBoard"), icon: Clock },
          {
            id: "appointments",
            label: t("uiAllClinicAppointments"),
            icon: Calendar,
          },
          { id: "patients", label: t("rolePatientDirectory"), icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                isActive
                  ? "bg-[var(--brand-primary)] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive
                      ? "bg-white text-[var(--brand-primary)]"
                      : "bg-amber-500 text-white animate-pulse"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. APPOINTMENT VERIFICATIONS & CONFIRMATION HUB */}
      {activeTab === "verifications" && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Filter Requests:
              </span>
              <div className="w-60">
                <CustomSelect
                  value={doctorFilter}
                  onChange={(val) => setDoctorFilter(val)}
                  options={[
                    { value: "all", label: "All Consulting Doctors" },
                    ...doctors.map((d) => ({
                      value: d.id,
                      label: `${d.name} (${d.specialization})`,
                    })),
                  ]}
                  placeholder="Select doctor..."
                />
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search patient, phone, serial #..."
                value={queueSearch}
                onChange={(e) => setQueueSearch(e.target.value)}
                className="w-full !pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          {/* Pending Verifications Queue */}
          {filteredPendingAppointments.length === 0 ? (
            <div className="p-12 sm:p-16 rounded-3xl bg-[var(--bg-surface)] border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                All Appointment Requests Verified!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No patient consultation requests are currently pending front desk verification. Any newly submitted online bookings will appear here for schedule, doctor, and payment validation.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("checkin")}
                  className="px-5 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold hover:opacity-95 transition cursor-pointer"
                >
                  Issue Fast Walk-in Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("queue")}
                  className="px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  View Active Chamber Queue
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {filteredPendingAppointments.length} Appointment
                  {filteredPendingAppointments.length === 1 ? "" : "s"} Awaiting Staff Verification & Confirmation
                </p>
                <span className="text-[11px] text-slate-400">
                  Review checklist → Mark Confirm to activate in doctor&apos;s queue
                </span>
              </div>

              {filteredPendingAppointments.map((appt) => {
                const isPaid =
                  appt.paymentStatus === "PAID" ||
                  appt.paymentStatus === "WAIVED" ||
                  (appt.fee ?? 0) === 0;
                const isDoctorAvailable = appt.doctor.available !== false;

                // Evaluate schedule
                const scheduleEval = evaluateDoctorSchedule(
                  appt.doctor.scheduleJson as ScheduleData,
                  appt.doctor.visitingHours,
                  appt.appointmentDate,
                  appt.doctor.chamberAddress
                );

                const hasAllergies = Array.isArray(appt.allergiesJson) && appt.allergiesJson.length > 0;
                const hasDiseases = Array.isArray(appt.diseasesJson) && appt.diseasesJson.length > 0;
                const hasFlags = Array.isArray(appt.medicalFlagsJson) && appt.medicalFlagsJson.length > 0;

                const allChecksPass = isPaid && isDoctorAvailable && scheduleEval.isAvailableOnDate;

                return (
                  <div
                    key={appt.id}
                    className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5 transition-all hover:shadow-md"
                  >
                    {/* Header: Patient Info + Token */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-primary)] border border-[var(--brand-border)] flex flex-col items-center justify-center font-black">
                          <span className="text-[9px] uppercase tracking-wider opacity-70">
                            {t("uiSerial")}
                          </span>
                          <span className="text-xl font-mono leading-none">#{appt.serialNumber}</span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                              {appt.patient.user.name}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                              {appt.patient.gender || "Patient"}
                            </span>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 uppercase tracking-wide">
                              {t("pendingVerification")}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {appt.patient.user.phone || "No phone recorded"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {appt.patient.user.email}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Consultation Meta */}
                      <div className="text-left sm:text-right space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Target Consultation
                        </span>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                          {new Date(appt.appointmentDate).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-xs font-semibold text-[var(--brand-text)] block">
                          Dr. {appt.doctor.user.name} • {appt.doctor.specialization}
                        </span>
                      </div>
                    </div>

                    {/* 4 Interactive Verification Blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
                      {/* Check 1: Payment Verification */}
                      <div
                        className={`p-4 rounded-2xl border transition-all ${
                          isPaid
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
                            <CreditCard className="w-3.5 h-3.5" />
                            1. Payment Status
                          </span>
                          {isPaid ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase">
                              ✓ Paid
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase">
                              ! Due
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="font-extrabold text-sm flex items-center justify-between">
                            <span>Fee: ${appt.fee}</span>
                            <span className="text-[11px] font-mono opacity-80">
                              {appt.paymentMethod || "Pending"}
                            </span>
                          </div>
                          <p className="text-[11px] opacity-80 leading-tight">
                            {isPaid
                              ? `Fee settled via ${appt.paymentMethod || "Stripe"}. Receipt verified.`
                              : `Payment of $${appt.fee} pending collection at front desk.`}
                          </p>
                        </div>

                        {/* Quick desk payment actions if pending */}
                        {!isPaid && (
                          <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              disabled={markingPaymentId === appt.id}
                              onClick={() => handleMarkPaymentOnly(appt.id, "CASH")}
                              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold cursor-pointer transition"
                            >
                              Collect Cash
                            </button>
                            <button
                              type="button"
                              disabled={markingPaymentId === appt.id}
                              onClick={() => handleMarkPaymentOnly(appt.id, "CARD_POS")}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold cursor-pointer transition"
                            >
                              Card POS
                            </button>
                            <button
                              type="button"
                              disabled={markingPaymentId === appt.id}
                              onClick={() => handleMarkPaymentOnly(appt.id, "WAIVED")}
                              className="px-2 py-1 rounded-lg border border-amber-600/40 text-amber-900 dark:text-amber-200 text-[10px] font-bold hover:bg-amber-600/10 cursor-pointer transition"
                            >
                              Waive
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Check 2: Doctor Availability Check */}
                      <div
                        className={`p-4 rounded-2xl border transition-all ${
                          isDoctorAvailable
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
                            <Stethoscope className="w-3.5 h-3.5" />
                            2. Doctor On Duty
                          </span>
                          {isDoctorAvailable ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase">
                              ✓ Available
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase">
                              ✕ Off-Duty
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="font-extrabold text-sm truncate">
                            Dr. {appt.doctor.user.name}
                          </div>
                          <p className="text-[11px] opacity-80 leading-tight">
                            {isDoctorAvailable
                              ? "Physician status active. Chamber room ready for consultation."
                              : "Physician has marked off-duty. Reschedule or confirm with doctor."}
                          </p>
                          <span className="text-[10px] block opacity-75 pt-1">
                            Chamber: {appt.doctor.chamberAddress || "Main OPD Wing"}
                          </span>
                        </div>
                      </div>

                      {/* Check 3: Timing & Visiting Hours Check */}
                      <div
                        className={`p-4 rounded-2xl border transition-all ${
                          scheduleEval.isAvailableOnDate
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
                            <Clock className="w-3.5 h-3.5" />
                            3. Schedule Timing
                          </span>
                          {scheduleEval.isAvailableOnDate ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase">
                              ✓ Matches
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase">
                              ⚠ Off-Day
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="font-extrabold text-sm">
                            {scheduleEval.selectedDayName}
                          </div>
                          <p className="text-[11px] opacity-80 leading-tight">
                            {scheduleEval.isAvailableOnDate
                              ? `Hours: ${scheduleEval.formattedHours}`
                              : `Doctor scheduled for: ${scheduleEval.activeDays.join(", ")}`}
                          </p>
                          {!scheduleEval.isAvailableOnDate && (
                            <span className="text-[10px] block opacity-75 font-semibold text-amber-700 dark:text-amber-300">
                              *Staff override allowed for emergency consultations
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Check 4: Clinical Intake & Allergies */}
                      <div className="p-4 rounded-2xl bg-[var(--bg-app)] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-400">
                            <HeartPulse className="w-3.5 h-3.5" />
                            4. Triage & Intake
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {appt.visitType === "REPORT_REVIEW"
                              ? "Report Review"
                              : appt.visitType === "FOLLOWUP"
                              ? "Follow-up"
                              : "First Visit"}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {hasAllergies ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[10px] font-black">
                              <AlertTriangle className="w-3 h-3 text-rose-500" />
                              Allergy: {appt.allergiesJson?.join(", ")}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 block">
                              No known drug allergies reported
                            </span>
                          )}

                          {hasDiseases && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                              Conditions: {appt.diseasesJson?.join(", ")}
                            </p>
                          )}

                          {hasFlags && (
                            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold truncate">
                              Flags: {appt.medicalFlagsJson?.join(", ")}
                            </p>
                          )}

                          {appt.notes && (
                            <p className="text-[10px] text-slate-500 italic truncate pt-0.5 border-t border-slate-200/60 dark:border-slate-800/60">
                              ↳ &quot;{appt.notes}&quot;
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar Footer */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-xs">
                        {allChecksPass ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            All 3 Core Checks Passed (Payment, Doctor Availability, Schedule). Ready to activate.
                          </span>
                        ) : !isPaid ? (
                          <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4" />
                            Payment collection pending before doctor chamber entry.
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" />
                            Doctor availability or schedule warning flagged. Review before confirming.
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Reject / Cancel request */}
                        <button
                          type="button"
                          onClick={() => handleOpenStaffCancel(appt)}
                          className="px-4 py-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t("uiRejectCancel")}</span>
                        </button>

                        {/* If payment is not made yet, provide 1-click Cash & Confirm */}
                        {!isPaid && (appt.fee ?? 0) > 0 && (
                          <button
                            type="button"
                            disabled={markingPaymentId === appt.id || confirmingId === appt.id}
                            onClick={() => handleCollectPaymentAndConfirm(appt.id, "CASH")}
                            className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Collect ${appt.fee} Cash & Confirm</span>
                          </button>
                        )}

                        {/* Standard Confirm & Activate button (mark as simple active) */}
                        <button
                          type="button"
                          disabled={confirmingId === appt.id || markingPaymentId === appt.id}
                          onClick={() => handleConfirmAppointment(appt.id)}
                          className="px-6 py-2.5 rounded-2xl bg-[var(--brand-primary)] hover:opacity-95 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                        >
                          {confirmingId === appt.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{t("uiActivating")}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{t("uiConfirmActivateTurn")}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. FAST CHECK-IN & QUEUE TICKET DISPENSER (WALK-INS) */}
      {activeTab === "checkin" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Form (8 Cols) */}
          <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
            <div className="flex items-start flex-col justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[var(--brand-primary)]" />
                  Fast Patient Intake & Serial Dispenser
                </h2>
                <p className="text-xs text-slate-500">
                  Direct receptionist issuance. Appointments created here are verified and confirmed immediately (&quot;thats done&quot;).
                </p>
              </div>

              {/* Mode switch: Walk-in vs Existing */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPatientMode("walkin")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    patientMode === "walkin"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  New Walk-in
                </button>
                <button
                  type="button"
                  onClick={() => setPatientMode("existing")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    patientMode === "existing"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Existing Patient
                </button>
              </div>
            </div>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              {/* Doctor Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Consulting Physician *
                </label>
                <CustomSelect
                  value={selectedDoctorId}
                  onChange={(val) => setSelectedDoctorId(val)}
                  options={doctors.map((d) => ({
                    value: d.id,
                    label: `${d.name} — ${d.specialization} (${d.chamberAddress || "Main OPD"})`,
                  }))}
                  placeholder="Select consulting doctor..."
                />
              </div>

              {/* Walk-in Patient Info */}
              {patientMode === "walkin" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Patient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={walkinName}
                      onChange={(e) => setWalkinName(e.target.value)}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={walkinPhone}
                      onChange={(e) => setWalkinPhone(e.target.value)}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Gender
                    </label>
                    <div className="flex gap-2">
                      {["Male", "Female", "Other"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setWalkinGender(g)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                            walkinGender === g
                              ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-xs"
                              : "bg-[var(--bg-app)] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 34"
                      value={walkinAge}
                      onChange={(e) => setWalkinAge(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                </div>
              ) : (
                /* Existing Patient Search */
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Search Registered Patient
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Type name, phone or email..."
                      value={searchPatientQuery}
                      onChange={(e) => setSearchPatientQuery(e.target.value)}
                      className={`${inputClasses} !pl-10`}
                    />
                  </div>

                  {/* Patient selection list */}
                  <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredExistingPatients.map((p) => {
                      const isSelected = selectedExistingPatientId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedExistingPatientId(p.id)}
                          className={`p-2.5 text-xs flex items-center justify-between cursor-pointer transition ${
                            isSelected
                              ? "bg-[var(--brand-surface)] text-[var(--brand-text)] font-bold"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <div>
                            <span className="font-semibold block">{p.user.name}</span>
                            <span className="text-[11px] text-slate-400">
                              {p.user.phone || "No phone"} • {p.user.email}
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[var(--brand-primary)]" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Triage Vitals Strip */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                  Pre-Consultation Vitals & Triage (Optional)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="BP (120/80)"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Pulse (72 bpm)"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Temp (98.6 °F)"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Weight (65 kg)"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Chief Complaint */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Complaint / Symptoms
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fever x 3 days, acute throat irritation"
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  className={inputClasses}
                />
              </div>

              {/* Clinical Intake Accordion */}
              <ClinicalIntakeForm
                value={intake}
                onChange={setIntake}
              />

              {/* Reception Fee Breakdown & Method */}
              {staffEffectiveBreakdown && (
                <div className="p-4 rounded-2xl bg-[var(--bg-app)] border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Consultation Visit Type & Desk Collection
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {staffEffectiveBreakdown.reason}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setStaffVisitType("NEW")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        staffVisitType === "NEW"
                          ? "bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500"
                          : "bg-[var(--bg-surface)] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold block">
                        {t("uiFirstVisit")}
                      </span>
                      <span className="text-base font-black font-mono block text-slate-900 dark:text-white">
                        ${staffEffectiveBreakdown.newPatientFee}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStaffVisitType("FOLLOWUP")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        staffVisitType === "FOLLOWUP"
                          ? "bg-teal-500/10 border-teal-500 text-teal-900 dark:text-teal-200 ring-1 ring-teal-500"
                          : "bg-[var(--bg-surface)] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold block">
                        {t("followUp")}
                      </span>
                      <span className="text-base font-black font-mono block text-slate-900 dark:text-white">
                        ${staffEffectiveBreakdown.followupFee}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStaffVisitType("REPORT_REVIEW")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        staffVisitType === "REPORT_REVIEW"
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500"
                          : "bg-[var(--bg-surface)] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold block">
                        {t("uiReportReview")}
                      </span>
                      <span className="text-base font-black font-mono block text-emerald-600 dark:text-emerald-400">
                        {t("uiFree4")}
                      </span>
                    </button>
                  </div>

                  {/* Payment Method selector */}
                  {staffVisitType !== "REPORT_REVIEW" && (
                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        {t("uiPaymentCollected")}
                      </span>
                      <div className="flex gap-2">
                        {(["CASH", "CARD_POS", "WAIVED"] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setStaffPaymentMethod(m)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                              staffPaymentMethod === m
                                ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                                : "bg-[var(--bg-surface)] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {m === "CASH" ? "Cash Received" : m === "CARD_POS" ? "Card POS" : "Fee Waived"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-extrabold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t("uiIssuingSerialTicketConfirming")}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t("uiIssueConfirmedQueueTicketActive")}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Ticket Preview (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  {t("uiLastIssuedSerialSlip")}
                </h3>
                {issuedTicket && (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t.print}</span>
                  </button>
                )}
              </div>

              {issuedTicket ? (
                <div className="p-5 rounded-2xl bg-[var(--brand-surface)] border-2 border-[var(--brand-primary)]/40 text-center space-y-3 print:bg-white print:border-black">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-text)] block">
                      {t("uiQueueTicketIssuedConfirmed")}
                    </span>
                    <span className="text-4xl font-black text-[var(--brand-primary)]">
                      #{issuedTicket.serialNumber}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[var(--brand-primary)]/20 text-left text-xs space-y-1.5">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {t.patientName}: {issuedTicket.patient.user.name}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      {t.doctor}: {issuedTicket.doctor.user.name} ({issuedTicket.doctor.specialization})
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      {t.chamber}: {issuedTicket.doctor.chamberAddress || (t("uiOpdConsultationChamber"))}
                    </p>
                    <div className="pt-1.5 border-t border-[var(--brand-primary)]/10 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        {issuedTicket.visitType === "REPORT_REVIEW"
                          ? (t("uiReportReview"))
                          : issuedTicket.visitType === "FOLLOWUP"
                          ? (t("followUp"))
                          : (t("firstVisitFee"))}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {issuedTicket.fee === 0
                          ? (t("uiFree2"))
                          : `$${issuedTicket.fee} • ${t("uiPaid")} (${issuedTicket.paymentMethod || "Desk"})`}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Activity className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">
                    {t("uiNoTicketDispensedYet")}
                  </p>
                  <p className="text-[11px]">
                    {t("uiCompleteTheIntakeFormTo")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. TODAY'S LIVE QUEUE BOARD */}
      {activeTab === "queue" && (
        <div className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t("uiTodaySActiveConsultationQueue")}
              </h2>
              <p className="text-xs text-slate-500">{t("uiLivePatientTurnTrackerAcross")}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="w-56">
                <CustomSelect
                  value={doctorFilter}
                  onChange={(val) => setDoctorFilter(val)}
                  options={[
                    { value: "all", label: t("uiAllDoctors") },
                    ...doctors.map((d) => ({
                      value: d.id,
                      label: `${d.name} (${d.specialization})`,
                    })),
                  ]}
                  placeholder={t("uiFilterByDoctor")}
                />
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t("uiFilterSerialOrPatient")}
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  className="!pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-3">{t("uiSerial2")}</th>
                  <th className="py-2.5 px-3">{t("rolePatient")}</th>
                  <th className="py-2.5 px-3">{t("uiConsultingDoctor")}</th>
                  <th className="py-2.5 px-3">{t("uiFeePayment2")}</th>
                  <th className="py-2.5 px-3">{t.statusLabel}</th>
                  <th className="py-2.5 px-3 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {todayAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No confirmed patients in active queue for today yet.
                    </td>
                  </tr>
                ) : (
                  todayAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition">
                      <td className="py-3 px-3 font-mono font-black text-sm text-[var(--brand-primary)]">
                        #{appt.serialNumber}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {appt.patient.user.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {appt.patient.user.phone || appt.patient.user.email}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {appt.doctor.user.name}
                        </span>
                        <span className="text-[11px] text-[var(--brand-text)]">
                          {appt.doctor.specialization}{appt.doctor.chamberAddress ? ` (${appt.doctor.chamberAddress})` : ""}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          ${appt.fee}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {appt.paymentStatus} ({appt.paymentMethod || "Desk"})
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            appt.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : appt.status === "CANCELLED"
                              ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                          }`}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openReportUploadModal(appt.patient.id, appt.patient.user.name, appt.doctor.id)}
                            title="Upload patient test report / lab scan"
                            className="px-2 py-1 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] hover:brightness-95 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>+ Report</span>
                          </button>
                          {(appt.status === "CONFIRMED" || appt.status === "BOOKED") && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(appt.id, "COMPLETED")}
                                title="Mark Consulted"
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold cursor-pointer"
                              >
                                ✓ Done
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenStaffCancel(appt)}
                                title="Cancel Ticket"
                                className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ALL CLINIC APPOINTMENTS & CANCELLATIONS */}
      {activeTab === "appointments" && (
        <div className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t("uiAllClinicAppointmentsLogs")}
              </h2>
              <p className="text-xs text-slate-500">
                {t("uiAuditTrailOfVerifiedPending")}
              </p>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
              {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setAllApptsStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    allApptsStatusFilter === st
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {st === "ALL" ? (t("uiAll")) : st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-3">{t("uiDateSerial")}</th>
                  <th className="py-2.5 px-3">{t("rolePatient")}</th>
                  <th className="py-2.5 px-3">{t("roleDoctor")}</th>
                  <th className="py-2.5 px-3">{t("uiPayment")}</th>
                  <th className="py-2.5 px-3">{t("uiStatusVerification")}</th>
                  <th className="py-2.5 px-3 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAllAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      {t("uiNoAppointmentsMatchThisFilter")}
                    </td>
                  </tr>
                ) : (
                  filteredAllAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition">
                      <td className="py-3 px-3">
                        <span className="font-mono font-black text-sm text-[var(--brand-primary)] block">
                          #{appt.serialNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(appt.appointmentDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {appt.patient.user.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {appt.patient.user.phone || appt.patient.user.email}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {appt.doctor.user.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {appt.doctor.specialization}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          ${appt.fee}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded block max-w-fit mt-0.5 ${
                            appt.paymentStatus === "PAID"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : appt.paymentStatus === "WAIVED"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          {appt.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 space-y-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                            appt.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : appt.status === "CANCELLED"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                              : appt.status === "PENDING"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                          }`}
                        >
                          {appt.status}
                        </span>

                        {appt.verifiedBy && (
                          <span className="text-[10px] text-slate-400 block">
                            Verified by: {appt.verifiedBy}
                          </span>
                        )}

                        {appt.status === "CANCELLED" && (
                          <div className="text-[10px] text-rose-600 dark:text-rose-400">
                            {appt.cancellationReason && <span>↳ {appt.cancellationReason}</span>}
                            {appt.refundStatus === "REFUNDED" && (
                              <span className="block font-bold text-emerald-600 dark:text-emerald-400">
                                ✓ Refund Issued: ${appt.refundAmount || appt.fee}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {appt.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={() => handleConfirmAppointment(appt.id)}
                              className="px-2.5 py-1 rounded-lg bg-[var(--brand-primary)] text-white text-[11px] font-bold hover:opacity-90 cursor-pointer"
                            >
                              Verify & Confirm
                            </button>
                          )}

                          {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                            <button
                              type="button"
                              onClick={() => handleOpenStaffCancel(appt)}
                              className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. PATIENTS DIRECTORY */}
      {activeTab === "patients" && (
        <div className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t("uiRegisteredPatientsDirectory")}</span>
                {patients.filter((p) => p.user.isApproved === false).length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {patients.filter((p) => p.user.isApproved === false).length} {t("pendingVerification")}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                {t("rolePatientDirectoryAndAccountVerificationGovernanceVerifyRegisteredPatientsToEnableTheirPatientPortalAccess")}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 self-start sm:self-auto">
              {patients.length} {t("uiTotalPatients")}
            </span>
          </div>

          {/* Success Banner */}
          {patientVerifySuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{patientVerifySuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setPatientVerifySuccess(null)}
                className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 cursor-pointer text-xs"
              >
                {t("uiDismiss")}
              </button>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPatientFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  patientFilter === "ALL"
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "bg-[var(--bg-app)] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                All Patients ({patients.length})
              </button>

              <button
                type="button"
                onClick={() => setPatientFilter("PENDING")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  patientFilter === "PENDING"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-[var(--bg-app)] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{t("pendingVerification")}</span>
                {patients.filter((p) => p.user.isApproved === false).length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {patients.filter((p) => p.user.isApproved === false).length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPatientFilter("VERIFIED")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  patientFilter === "VERIFIED"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-[var(--bg-app)] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t("verified")} ({patients.filter((p) => p.user.isApproved !== false).length})</span>
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={patientSearchQuery}
                onChange={(e) => setPatientSearchQuery(e.target.value)}
                placeholder={t("uiSearchPatientNamePhoneEmail")}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--bg-app)] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          {/* Patient Cards Grid */}
          {patients
            .filter((p) => {
              if (patientFilter === "PENDING") return p.user.isApproved === false;
              if (patientFilter === "VERIFIED") return p.user.isApproved !== false;
              return true;
            })
            .filter((p) => {
              if (!patientSearchQuery.trim()) return true;
              const q = patientSearchQuery.toLowerCase();
              return (
                p.user.name.toLowerCase().includes(q) ||
                p.user.email.toLowerCase().includes(q) ||
                (p.user.phone && p.user.phone.toLowerCase().includes(q))
              );
            }).length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              {t("uiNoPatientsFoundMatchingThe")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {patients
                .filter((p) => {
                  if (patientFilter === "PENDING") return p.user.isApproved === false;
                  if (patientFilter === "VERIFIED") return p.user.isApproved !== false;
                  return true;
                })
                .filter((p) => {
                  if (!patientSearchQuery.trim()) return true;
                  const q = patientSearchQuery.toLowerCase();
                  return (
                    p.user.name.toLowerCase().includes(q) ||
                    p.user.email.toLowerCase().includes(q) ||
                    (p.user.phone && p.user.phone.toLowerCase().includes(q))
                  );
                })
                .map((pat) => (
                  <div
                    key={pat.id}
                    className="p-4 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block">
                            {pat.user.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {pat.user.email}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold uppercase shrink-0">
                          {pat.gender || "Patient"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{pat.user.phone || (t("uiNoPhoneRecorded"))}</span>
                      </div>

                      {/* Verification Status Badge */}
                      <div className="pt-1">
                        {pat.user.isApproved === false ? (
                          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{t("uiPendingStaffVerification")}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>{t("uiVerifiedActive")}</span>
                          </span>
                        )}
                      </div>

                      {pat.medicalHistory && (
                        <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800 truncate">
                          History: {pat.medicalHistory}
                        </p>
                      )}
                    </div>

                    {/* Action button if pending verification */}
                    {pat.user.isApproved === false && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          disabled={verifyingPatientId === pat.id}
                          onClick={() => handleVerifyPatient(pat.id, pat.user.name)}
                          className="w-full py-2 px-3 rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {verifyingPatientId === pat.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          )}
                          <span>{t("uiVerifyActivateAccount")}</span>
                        </button>
                      </div>
                    )}

                    {/* Diagnostic Report Upload Button (Requirement 12 & 13) */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openReportUploadModal(pat.id, pat.user.name)}
                        className="w-full py-2 px-3 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] hover:brightness-95 font-bold text-xs shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t("uploadLabReport")}</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Staff Administrative Cancellation & Refund Modal */}
      {staffCancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[var(--bg-surface)] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {t("uiCancelAppointmentRequest")}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t("uiSerial")} #{staffCancelTarget.serialNumber} • {t.patientName}: {staffCancelTarget.patient.user.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStaffCancelTarget(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Target Overview */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-app)] border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t.doctor}</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  Dr. {staffCancelTarget.doctor.user.name}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  {t("uiConsultationDate")}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {new Date(staffCancelTarget.appointmentDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  {t("uiPaymentStatus")}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {staffCancelTarget.paymentStatus} (${staffCancelTarget.fee})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  {t("uiCurrentStatus")}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {staffCancelTarget.status}
                </span>
              </div>
            </div>

            {/* Refund Options if payment was made */}
            {staffCancelTarget.paymentStatus === "PAID" && (staffCancelTarget.fee ?? 0) > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === "bn" ? `রিফান্ড সিদ্ধান্ত (প্রদত্ত ফি: $${staffCancelTarget.fee})` : `Refund Decision (Paid Fee: $${staffCancelTarget.fee})`}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStaffRefundChoice("FULL")}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer text-left ${
                      staffRefundChoice === "FULL"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500"
                        : "bg-[var(--bg-app)] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <span className="block text-[10px] uppercase opacity-75">
                      {t("fullRefund")}
                    </span>
                    <span className="block font-mono text-sm">${staffCancelTarget.fee}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStaffRefundChoice("NONE")}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer text-left ${
                      staffRefundChoice === "NONE"
                        ? "bg-rose-500/10 border-rose-500 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500"
                        : "bg-[var(--bg-app)] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <span className="block text-[10px] uppercase opacity-75">
                      {t("uiNoRefund")}
                    </span>
                    <span className="block font-mono text-sm">$0.00</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStaffRefundChoice("CUSTOM")}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer text-left ${
                      staffRefundChoice === "CUSTOM"
                        ? "bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500"
                        : "bg-[var(--bg-app)] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <span className="block text-[10px] uppercase opacity-75">
                      {t("uiCustom")}
                    </span>
                    <span className="block font-mono text-sm">
                      {t("uiPartial")}
                    </span>
                  </button>
                </div>

                {staffRefundChoice === "CUSTOM" && (
                  <div className="pt-1">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      {t("uiEnterCustomRefundAmount")}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      max={staffCancelTarget.fee ?? 0}
                      value={staffRefundAmount}
                      onChange={(e) => setStaffRefundAmount(parseFloat(e.target.value) || 0)}
                      className={inputClasses}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Cancellation Reason */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("uiCancellationReason")}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { en: "Physician Emergency / Off-duty", bn: "চিকিৎসকের জরুরি সমস্যা / অনুপস্থিত" },
                  { en: "Patient Requested via Phone", bn: "ফোনে রোগীর অনুরোধ" },
                  { en: "Duplicate Booking Request", bn: "একাধিকবার বুকিং অনুরোধ" },
                  { en: "Payment Not Received", bn: "পেমেন্ট পাওয়া যায়নি" },
                  { en: "Clinic Operational Reschedule", bn: "ক্লিনিকের সময়সূচী পরিবর্তন" },
                ].map((preset) => (
                  <button
                    key={preset.en}
                    type="button"
                    onClick={() => setStaffCancelReason(language === "bn" ? preset.bn : preset.en)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      staffCancelReason === (language === "bn" ? preset.bn : preset.en)
                        ? "bg-[var(--brand-primary)] text-white"
                        : "bg-[var(--bg-app)] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {language === "bn" ? preset.bn : preset.en}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                value={staffCancelReason}
                onChange={(e) => setStaffCancelReason(e.target.value)}
                placeholder={t("uiAdditionalNotesOnWhyThis")}
                className="w-full mt-1.5 p-3 rounded-2xl bg-[var(--bg-app)] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={staffCancelSubmitting}
                onClick={() => setStaffCancelTarget(null)}
                className="px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-50"
              >
                {t("uiKeepAppointment")}
              </button>
              <button
                type="button"
                disabled={staffCancelSubmitting || !staffCancelReason.trim()}
                onClick={handleStaffConfirmCancel}
                className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {staffCancelSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t("uiProcessingCancellation")}</span>
                  </>
                ) : (
                  <span>{t("confirmCancellation")}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Diagnostic Lab Report Upload Modal (Requirement 12 & 13) */}
      {uploadReportModalOpen && reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[var(--bg-surface)] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-primary)] border border-[var(--brand-border)] flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Upload Diagnostic Lab Report
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient: <strong className="text-slate-800 dark:text-slate-200">{reportTarget.patientName}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUploadReportModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadTestReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Report Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Blood Count (CBC) / Chest X-Ray"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Category / Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hematology Lab / 12h Overnight Fasting"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Document / Scan File (PDF or Image) *
                </label>
                <input
                  type="file"
                  required
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[var(--brand-surface)] file:text-[var(--brand-text)] hover:file:brightness-95 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Reception Notes / Preliminary Impression
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Patient brought previous scan from outside diagnostic clinic..."
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              {reportError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{reportError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setUploadReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingReport}
                  className="px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold hover:opacity-95 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {uploadingReport ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t("uploadingAndAttaching")}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>{t("uiUploadAttachToRecord")}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
