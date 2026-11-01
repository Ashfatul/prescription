import { Metadata } from "next";
import { 
  AlertCircle, 
  PhoneCall, 
  Stethoscope, 
  Pill, 
  Microscope, 
  ShieldCheck, 
  HeartHandshake 
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LegalNav } from "@/components/legal/legal-nav";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";

export const metadata: Metadata = {
  title: "Medical Disclaimer & Clinical Prescribing Standards | PPMS",
  description: "Official medical disclaimer and clinical prescribing standards for the Patient Prescription Management System.",
};

export default async function DisclaimerPage() {
  const [user, settings] = await Promise.all([
    getCurrentUserFromCookie(),
    getHospitalSettings(),
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Header loggedIn={!!user} />

      <LegalNav 
        title="Medical Disclaimer & Prescribing Standards" 
        lastUpdated="November 1, 2026" 
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-10 shadow-xs space-y-10 leading-relaxed text-sm text-slate-700 dark:text-slate-300">
          
          {/* High Priority Emergency Alert Banner */}
          <div className="p-6 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-900 dark:text-rose-200 space-y-3">
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 animate-bounce" />
              <h2 className="text-base sm:text-lg font-black tracking-tight text-rose-950 dark:text-white">
                EMERGENCY MEDICAL WARNING
              </h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">
              <strong>DO NOT USE THIS PLATFORM FOR EMERGENCY MEDICAL CONDITIONS.</strong> If you or someone you are assisting is experiencing severe chest pain, shortness of breath, acute hemorrhage, signs of stroke (facial drooping, arm weakness, slurred speech), loss of consciousness, or severe trauma, immediately call the <strong>Hospital Emergency Hotline at {settings.emergencyHotline}</strong> or go to the nearest emergency trauma center.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>1. Software Tool vs. Independent Medical Practice</span>
            </h2>
            <p>
              The Patient Prescription Management System (PPMS) is an administrative and clinical workflow tool designed to assist registered medical doctors and hospital departments in composing, formatting, paginating, and printing medical prescriptions.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              The platform does not provide diagnostic services, recommend specific therapeutic courses, or evaluate individual patient symptoms. Every clinical entry, diagnosis, pharmaceutical prescription, dosage, and diagnostic test order is made solely and exclusively by the examining licensed physician.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>2. No Doctor-Patient Relationship Established by Browsing</span>
            </h2>
            <p>
              Accessing this website, browsing the public consulting physicians directory, reviewing chamber visiting hours, or inspecting public API feeds does not create a doctor-patient relationship between you and any listed medical specialist.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              A legally recognized doctor-patient relationship is established only upon the formal commencement of a clinical consultation within the doctor&apos;s physical chamber or authorized hospital teleconsultation block.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>3. Pharmaceutical Formulary & Default Dose Presets</span>
            </h2>
            <p>
              The system formulary provides standard catalog information (generic names, dosage forms such as Tablet or Capsule, default directions such as &ldquo;1+0+1 after meal&rdquo;) as a convenience to reduce repetitive typing for clinicians.
            </p>
            <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs space-y-2">
              <p>
                • <strong>Physician Obligation:</strong> The prescribing physician must review and verify all dosages, frequencies, and administration durations for each specific patient, considering age, body surface area, renal or hepatic function, pregnancy status, and potential drug interactions.
              </p>
              <p>
                • <strong>Dispensing Pharmacists:</strong> Pharmacists dispensing medications based on PPMS prescriptions must verify the prescription&apos;s BMDC registration seal and date before dispensing scheduled substances.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Microscope className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>4. Diagnostic Investigations & Attached Lab Reports</span>
            </h2>
            <p>
              Digital documents, radiology scans (X-Ray, CT, MRI), and pathology reports uploaded into the prescription editor are archival representations provided for clinical reference.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>Digital scan rendering fidelity depends on client screen resolution and the quality of the uploaded source file.</li>
              <li>Definitive clinical decisions must be supported by official signed laboratory diagnostic reports from accredited diagnostic facilities.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span>5. Patient Adherence & Adverse Drug Reaction Protocol</span>
            </h2>
            <p>
              Patients receiving prescriptions generated via PPMS are advised to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>Follow the physician&apos;s directions precisely without altering doses or discontinuing antibiotics prematurely.</li>
              <li>Read all package inserts and contraindication warnings provided by the dispensing pharmacy.</li>
              <li>In the event of unexpected side effects, cutaneous rash, facial swelling, or breathing difficulties, immediately discontinue the medication and seek emergency medical care.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>6. Regulatory Compliance & Accreditation</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              All prescription layouts and doctor credential blocks generated by PPMS comply with the standard guidelines set forth by the Bangladesh Medical & Dental Council (BMDC), ensuring proper display of physician degrees, registration identifiers, clinical notes, patient identification numbers, and legal signature areas.
            </p>
          </section>

        </div>
      </main>

      <Footer initialSettings={settings} />
    </div>
  );
}
