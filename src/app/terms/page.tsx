import { Metadata } from "next";
import { 
  Scale, 
  Stethoscope, 
  AlertTriangle, 
  UserCheck, 
  CalendarCheck, 
  ShieldAlert, 
  Building2 
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LegalNav } from "@/components/legal/legal-nav";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";

export const metadata: Metadata = {
  title: "Terms of Service Agreement | PPMS",
  description: "Terms of Service and Clinical Platform Usage Agreement for Patient Prescription Management System.",
};

export default async function TermsPage() {
  const [user, settings] = await Promise.all([
    getCurrentUserFromCookie(),
    getHospitalSettings(),
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Header loggedIn={!!user} />

      <LegalNav 
        title="Terms of Service & Clinical Usage Agreement" 
        lastUpdated="November 1, 2026" 
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-10 shadow-xs space-y-10 leading-relaxed text-sm text-slate-700 dark:text-slate-300">
          
          {/* Executive Summary Callout */}
          <div className="p-5 rounded-2xl bg-[var(--brand-surface)] border border-[var(--brand-border)]/60 text-xs text-[var(--brand-text)] flex items-start gap-3.5">
            <Scale className="w-5 h-5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-sm font-bold text-[var(--text-primary)]">
                Clinical Platform Usage Summary
              </strong>
              <p className="leading-relaxed">
                By accessing or using the Patient Prescription Management System (PPMS), physicians, administrative staff, and patients agree to be bound by these Terms of Service. Registered doctors remain exclusively responsible for their clinical diagnostic determinations and drug prescriptions.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>1. Physician Licensure & BMDC Credential Requirements</span>
            </h2>
            <p>
              The prescription authoring module within PPMS is restricted exclusively to duly licensed medical practitioners registered with the Bangladesh Medical & Dental Council (BMDC) or equivalent national statutory medical licensing authorities.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>Physicians must provide their verified BMDC registration number, academic degrees, and chamber affiliation.</li>
              <li>Impersonating a licensed doctor or issuing prescriptions using another clinician&apos;s credentials is a criminal offense and grounds for immediate account termination and legal reporting.</li>
              <li>The physician&apos;s digital signature and legal stamp applied on issued prescriptions constitute legal authorization by that specific practitioner.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>2. Independent Medical Judgment & Decision Support</span>
            </h2>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
              <strong>CRITICAL LEGAL NOTICE:</strong> PPMS is a clinical management software and documentation tool. It does not practice medicine, provide medical advice, or replace the professional diagnostic judgment of a qualified doctor.
            </div>
            <p>
              All auto-populated pharmaceutical suggestions, pre-configured dosage frequency chips (`1+0+1`, `1+1+1`), default meal timings, duration presets, and diagnostic test templates provided by the formulary are clinical convenience tools only.
            </p>
            <p>
              The prescribing physician bears sole, non-delegable legal liability to ensure that the medication, strength, route, frequency, contraindications, and drug-drug interactions are clinically indicated, appropriate, and safe for the individual patient.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>3. Appointments, Serial Tokens & Chamber Queue Rules</span>
            </h2>
            <p>
              Patients and hospital receptionists utilizing the appointment scheduling module agree to the following operational terms:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Serial Allocation</span>
                <p className="text-slate-500">Queue tokens are assigned sequentially on a first-come, first-served basis according to doctor visiting hours.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Emergency Triage Override</span>
                <p className="text-slate-500">Chamber physicians and triage nurses reserve the absolute right to prioritize emergency and critical trauma patients ahead of regular tokens.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Timely Arrival</span>
                <p className="text-slate-500">Patients are advised to check in at the reception desk at least 15 minutes before their estimated serial call time.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Cancellation & Rescheduling</span>
                <p className="text-slate-500">Appointments may be cancelled via the patient portal or front desk prior to doctor chamber consultation commencement.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>4. Account Security & Prohibited Activities</span>
            </h2>
            <p>
              Users are responsible for safeguarding their login credentials. The following actions are strictly prohibited:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>Sharing doctor credentials or staff authentication sessions across multiple unauthorized individuals.</li>
              <li>Attempting to bypass role-based permission checks, tamper with prescription records, or forge digital signature stamps.</li>
              <li>Bulk scraping or exporting patient health data outside authorized hospital clinical workflows.</li>
              <li>Injecting malicious software or interfering with system chamber queue operations.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>5. Limitation of Liability & Service Availability</span>
            </h2>
            <p>
              PPMS maintains a targeted availability of 99.9% uptime and provides local intranet deployment capabilities to withstand internet service interruptions. However:
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              To the maximum extent permitted by applicable law, PPMS and its software engineering team shall not be liable for any direct, indirect, incidental, or consequential damages arising from clinical treatment outcomes, misdiagnosis, pharmaceutical dispensing errors, or power/telecommunication outages at hospital premises.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>6. Governing Law & Dispute Resolution</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              These Terms shall be governed by and construed in accordance with the laws of the People&apos;s Republic of Bangladesh, the Medical and Dental Council Act, and national clinical practice standards. Any disputes shall be subject to the exclusive jurisdiction of the competent courts of Dhaka, Bangladesh.
            </p>
          </section>

        </div>
      </main>

      <Footer initialSettings={settings} />
    </div>
  );
}
