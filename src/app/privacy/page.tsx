import { Metadata } from "next";
import { 
  ShieldCheck, 
  Eye, 
  Database, 
  UserCheck, 
  FileCheck, 
  Server, 
  Mail 
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LegalNav } from "@/components/legal/legal-nav";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";

export const metadata: Metadata = {
  title: "Privacy Policy & Health Data Protection | PPMS",
  description: "Comprehensive privacy and clinical health data governance policy for Patient Prescription Management System.",
};

export default async function PrivacyPage() {
  const [user, settings] = await Promise.all([
    getCurrentUserFromCookie(),
    getHospitalSettings(),
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Header loggedIn={!!user} />

      <LegalNav 
        title="Privacy Policy & Health Data Protection" 
        lastUpdated="November 1, 2026" 
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-10 shadow-xs space-y-10 leading-relaxed text-sm text-slate-700 dark:text-slate-300">
          
          {/* Executive Summary Callout */}
          <div className="p-5 rounded-2xl bg-[var(--brand-surface)] border border-[var(--brand-border)]/60 text-xs text-[var(--brand-text)] flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-sm font-bold text-[var(--text-primary)]">
                Our Clinical Data Pledge
              </strong>
              <p className="leading-relaxed">
                The Patient Prescription Management System (PPMS) handles protected health information (PHI) with bank-grade encryption and strict medical confidentiality. Patient health records and prescriptions are strictly accessible only by authorized consulting physicians and authenticated clinical staff.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>1. Information We Collect</span>
            </h2>
            <p>
              When patients visit an outpatient department or physicians generate electronic prescriptions, we collect and store:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Patient Demographics:</strong> Full legal name, contact telephone number, date of birth / age, biological gender, and residential locality.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Clinical Triage & Vitals:</strong> Blood Pressure (systolic/diastolic), pulse rate, body temperature, weight, oxygen saturation (SpO2), and reported chief complaints.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Prescription Data:</strong> Prescribed pharmaceutical molecules, brand names, dosage instructions (e.g., 1+0+1), timings relative to meals, duration, clinical advice, and provisional diagnoses.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Diagnostic Attachments:</strong> Laboratory test results, blood biochemistry reports, ultrasonography images, and radiological PDF scans uploaded during consultation.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Technical Session Logs:</strong> User session cookies (`ppms_session`), IP address, login timestamps, and role-based audit trail logs.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>2. Purpose & Lawful Basis of Processing</span>
            </h2>
            <p>
              All clinical data is collected strictly for medical treatment and healthcare management purposes under the direct supervision of registered medical practitioners:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Clinical Prescription Delivery</span>
                <p className="text-slate-500">Generating legally compliant, multi-page BMDC format prescriptions with official doctor credentials.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Chamber Queue Coordination</span>
                <p className="text-slate-500">Allocating real-time serial tokens, managing patient waiting times, and preventing chamber overcrowding.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Medical History Continuity</span>
                <p className="text-slate-500">Providing physicians with past prescribed drugs and allergies during return follow-up consultations.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Hospital Epidemiologic Analytics</span>
                <p className="text-slate-500">Aggregated anonymized reporting on top prescribed medicines and disease prevalence for hospital supply planning.</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>3. Role-Based Access Isolation (RBAC)</span>
            </h2>
            <p>
              Access to patient charts is governed by strict principle-of-least-privilege role boundaries:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li><strong>Doctors:</strong> Full access to prescribe, review previous medical history, and view attached diagnostics for their registered patients.</li>
              <li><strong>Front Desk Staff:</strong> Restricted to registering walk-ins, logging pre-consultation vitals, and dispensing queue tickets; zero access to modify prescriptions.</li>
              <li><strong>Patients:</strong> Authenticated access only to their own prescriptions, appointment slips, and authorized diagnostic reports.</li>
              <li><strong>Super Admins:</strong> Platform infrastructure, formulary catalog maintenance, and role permission configurations without direct clinical tampering.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>4. Data Storage, Encryption & Intranet Operation</span>
            </h2>
            <p>
              PPMS is engineered to operate seamlessly across high-security hospital intranet environments as well as encrypted cloud infrastructures:
            </p>
            <div className="space-y-2 text-xs sm:text-sm">
              <p>
                • <strong>Encryption in Transit:</strong> All HTTP traffic is protected by Transport Layer Security (TLS 1.3) with encrypted session authentication cookies (`HttpOnly`, `SameSite=Lax`).
              </p>
              <p>
                • <strong>Credential Hashing:</strong> User passwords are encrypted using one-way adaptive bcrypt salt hashing. No plaintext credentials are ever written to disk.
              </p>
              <p>
                • <strong>On-Premise Intranet Option:</strong> Hospital deployments may run the PostgreSQL database entirely within the hospital firewall with zero external telemetry.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>5. Patient Rights & Data Control</span>
            </h2>
            <p>
              Under medical ethics and data privacy regulations, patients hold the following rights:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>The right to obtain a printed or digital copy of all issued prescriptions and appointment records.</li>
              <li>The right to request rectification of inaccurate personal details (e.g., misspelled name or incorrect contact phone).</li>
              <li>The right to request confidential deletion of account access credentials, subject to statutory medical record retention obligations.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>6. Contact the Data Protection Officer (DPO)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              If you have any questions regarding the confidentiality of your health data, or wish to exercise your patient rights, please contact our hospital data governance desk:
            </p>
            <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs space-y-1">
              <p><strong className="text-slate-900 dark:text-white">Hospital Data Protection Officer (DPO)</strong></p>
              <p>{settings.hospitalName} ({settings.hospitalBranch})</p>
              <p>{settings.hospitalAddress}</p>
              <p>Email: <a href={`mailto:${settings.supportEmail}`} className="text-[var(--brand-text)] font-semibold underline">{settings.supportEmail}</a></p>
              <p>Clinical Helpline: {settings.contactPhone} • Emergency: {settings.emergencyHotline}</p>
            </div>
          </section>

        </div>
      </main>

      <Footer initialSettings={settings} />
    </div>
  );
}
