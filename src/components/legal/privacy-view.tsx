"use client";

import { 
  ShieldCheck, 
  Eye, 
  Database, 
  UserCheck, 
  FileCheck, 
  Server, 
  Mail 
} from "lucide-react";
import { LegalNav } from "@/components/legal/legal-nav";
import { useLanguage } from "@/lib/i18n/language-context";
import { HospitalSettings } from "@/features/settings/settings.service";

export function PrivacyView({ settings }: { settings: HospitalSettings }) {
  const { language } = useLanguage();
  const isBn = language === "bn";

  return (
    <>
      <LegalNav 
        title={isBn ? "গোপনীয়তা নীতি ও স্বাস্থ্য ডেটা সুরক্ষা" : "Privacy Policy & Health Data Protection"} 
        lastUpdated={isBn ? "১ নভেম্বর, ২০২৬" : "November 1, 2026"} 
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-10 shadow-xs space-y-10 leading-relaxed text-sm text-slate-700 dark:text-slate-300">
          
          {/* Executive Summary Callout */}
          <div className="p-5 rounded-2xl bg-[var(--brand-surface)] border border-[var(--brand-border)]/60 text-xs text-[var(--brand-text)] flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-sm font-bold text-[var(--text-primary)]">
                {isBn ? "আমাদের ক্লিনিকাল ডেটা অঙ্গীকার" : "Our Clinical Data Pledge"}
              </strong>
              <p className="leading-relaxed">
                {isBn
                  ? "পেশেন্ট প্রেসক্রিপশন ম্যানেজমেন্ট সিস্টেম (পিপিএমএস) সুরক্ষিত স্বাস্থ্য তথ্য (PHI) সর্বোচ্চ মানের এনক্রিপশন এবং কঠোর মেডিকেল গোপনীয়তার সাথে সংরক্ষণ করে। রোগীদের স্বাস্থ্য রেকর্ড এবং প্রেসক্রিপশন কেবলমাত্র অনুমোদিত পরামর্শক চিকিৎসক ও যাচাইকৃত স্বাস্থ্যকর্মীদের প্রবেশাধিকারের আওতাভুক্ত।"
                  : "The Patient Prescription Management System (PPMS) handles protected health information (PHI) with bank-grade encryption and strict medical confidentiality. Patient health records and prescriptions are strictly accessible only by authorized consulting physicians and authenticated clinical staff."}
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{isBn ? "১. আমরা যে তথ্য সংগ্রহ করি" : "1. Information We Collect"}</span>
            </h2>
            <p>
              {isBn
                ? "রোগীরা যখন বহির্বিভাগে পরামর্শ গ্রহণ করেন বা চিকিৎসকরা ইলেকট্রনিক প্রেসক্রিপশন তৈরি করেন, তখন আমরা নিম্নলিখিত তথ্য সংগ্রহ ও সংরক্ষণ করি:"
                : "When patients visit an outpatient department or physicians generate electronic prescriptions, we collect and store:"}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  {isBn ? "রোগীর সাধারণ পরিচিতি:" : "Patient Demographics:"}
                </strong>{" "}
                {isBn
                  ? "পূর্ণ নাম, যোগাযোগের মোবাইল নম্বর, জন্ম তারিখ / বয়স, লিঙ্গ এবং বসবাসের এলাকা।"
                  : "Full legal name, contact telephone number, date of birth / age, biological gender, and residential locality."}
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  {isBn ? "ক্লিনিক্যাল ট্রায়াজ ও ভাইটালস:" : "Clinical Triage & Vitals:"}
                </strong>{" "}
                {isBn
                  ? "রক্তচাপ (BP), পালস রেট, শরীরের তাপমাত্রা, ওজন, অক্সিজেনের মাত্রা (SpO2) এবং প্রধান শারীরিক সমস্যাসমূহ।"
                  : "Blood Pressure (systolic/diastolic), pulse rate, body temperature, weight, oxygen saturation (SpO2), and reported chief complaints."}
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  {isBn ? "প্রেসক্রিপশন ডেটা:" : "Prescription Data:"}
                </strong>{" "}
                {isBn
                  ? "নির্ধারিত ওষুধের নাম, জেনেরিক মলিকিউল, সেবনের নিয়মাবলী (যেমন ১+০+১), খাবারের আগে/পরে সেবনের সময়, মেয়াদের সময়কাল, পরামর্শ এবং প্রাথমিক রোগ নির্ণয়।"
                  : "Prescribed pharmaceutical molecules, brand names, dosage instructions (e.g., 1+0+1), timings relative to meals, duration, clinical advice, and provisional diagnoses."}
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  {isBn ? "ডায়াগনস্টিক রিপোর্ট ও সংযুক্তি:" : "Diagnostic Attachments:"}
                </strong>{" "}
                {isBn
                  ? "পরামর্শের সময় আপলোড করা প্যাথলজি রিপোর্ট, রক্তের বায়োকেমিস্ট্রি রিপোর্ট, আল্ট্রাসনোগ্রাম ছবি এবং রেডিওলজিক্যাল পিডিএফ রিপোর্ট।"
                  : "Laboratory test results, blood biochemistry reports, ultrasonography images, and radiological PDF scans uploaded during consultation."}
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  {isBn ? "কারিগরি লগ ও সেশন:" : "Technical Session Logs:"}
                </strong>{" "}
                {isBn
                  ? "ইউজার সেশন কুকিজ (`ppms_session`), আইপি ঠিকানা, লগইন সময় এবং ভূমিকাভিত্তিক সিস্টেম অডিট লগ।"
                  : "User session cookies (`ppms_session`), IP address, login timestamps, and role-based audit trail logs."}
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{isBn ? "২. তথ্য প্রক্রিয়াকরণের উদ্দেশ্য ও আইনি ভিত্তি" : "2. Purpose & Lawful Basis of Processing"}</span>
            </h2>
            <p>
              {isBn
                ? "সকল ক্লিনিকাল তথ্য শুধুমাত্র চিকিৎসা সেবা প্রদান এবং নিবন্ধিত চিকিৎসকদের প্রত্যক্ষ তত্ত্বাবধানে স্বাস্থ্য ব্যবস্থাপনার উদ্দেশ্যে সংগৃহীত হয়:"
                : "All clinical data is collected strictly for medical treatment and healthcare management purposes under the direct supervision of registered medical practitioners:"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {isBn ? "ডিজিটাল প্রেসক্রিপশন প্রদান" : "Clinical Prescription Delivery"}
                </span>
                <p className="text-slate-500">
                  {isBn
                    ? "চিকিৎসকের অফিসিয়াল সনদসহ আইনসম্মত, বহু-পৃষ্ঠার বিএমডিসি ফরম্যাট প্রেসক্রিপশন তৈরি।"
                    : "Generating legally compliant, multi-page BMDC format prescriptions with official doctor credentials."}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {isBn ? "চেম্বার কিউ সমন্বয়" : "Chamber Queue Coordination"}
                </span>
                <p className="text-slate-500">
                  {isBn
                    ? "রিয়েল-টাইম সিরিয়াল টোকেন বরাদ্দ, অপেক্ষার সময় ব্যবস্থাপনা এবং চেম্বারে ভিড় প্রতিরোধ।"
                    : "Allocating real-time serial tokens, managing patient waiting times, and preventing chamber overcrowding."}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {isBn ? "চিকিৎসা ইতিহাসের ধারাবাহিকতা" : "Medical History Continuity"}
                </span>
                <p className="text-slate-500">
                  {isBn
                    ? "পুনরায় ফলো-আপ পরামর্শের সময় পূর্বে নির্ধারিত ওষুধ ও অ্যালার্জির তথ্য চিকিৎসকের কাছে উপস্থাপন।"
                    : "Providing physicians with past prescribed drugs and allergies during return follow-up consultations."}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {isBn ? "হাসপাতাল স্বাস্থ্য পরিসংখ্যান" : "Hospital Epidemiologic Analytics"}
                </span>
                <p className="text-slate-500">
                  {isBn
                    ? "ওষুধের সরবরাহ ও স্বাস্থ্য ব্যবস্থার পরিকল্পনার জন্য রোগ বিস্তার ও বহুল ব্যবহৃত ওষুধের গোপনীয় পরিসংখ্যান।"
                    : "Aggregated anonymized reporting on top prescribed medicines and disease prevalence for hospital supply planning."}
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{isBn ? "৩. ভূমিকাভিত্তিক প্রবেশাধিকার সুরক্ষা (RBAC)" : "3. Role-Based Access Isolation (RBAC)"}</span>
            </h2>
            <p>
              {isBn
                ? "রোগীদের স্বাস্থ্য তথ্যে প্রবেশাধিকার কঠোর নিরাপত্তা নীতিমালা দ্বারা সংরক্ষিত:"
                : "Access to patient charts is governed by strict principle-of-least-privilege role boundaries:"}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <strong>{isBn ? "চিকিৎসকবৃন্দ:" : "Doctors:"}</strong>{" "}
                {isBn
                  ? "প্রেসক্রিপশন তৈরি, পূর্ববর্তী চিকিৎসা ইতিহাস পর্যালোচনা এবং সংযুক্ত ডায়াগনস্টিক রিপোর্ট দেখার পূর্ণ অধিকার।"
                  : "Full access to prescribe, review previous medical history, and view attached diagnostics for their registered patients."}
              </li>
              <li>
                <strong>{isBn ? "ফ্রন্ট ডেস্ক ও নার্সিং স্টাফ:" : "Front Desk Staff:"}</strong>{" "}
                {isBn
                  ? "রোগী নিবন্ধন, প্রাথমিক ভাইটালস গ্রহণ এবং কিউ টিকিট বিতরণে সীমাবদ্ধ; প্রেসক্রিপশন পরিবর্তনের কোনো সুযোগ নেই।"
                  : "Restricted to registering walk-ins, logging pre-consultation vitals, and dispensing queue tickets; zero access to modify prescriptions."}
              </li>
              <li>
                <strong>{isBn ? "রোগীবৃন্দ:" : "Patients:"}</strong>{" "}
                {isBn
                  ? "শুধুমাত্র তাদের নিজস্ব প্রেসক্রিপশন, অ্যাপয়েন্টমেন্ট স্লিপ এবং অনুমোদিত ডায়াগনস্টিক রিপোর্ট দেখার অনুমতি।"
                  : "Authenticated access only to their own prescriptions, appointment slips, and authorized diagnostic reports."}
              </li>
              <li>
                <strong>{isBn ? "সুপার অ্যাডমিন:" : "Super Admins:"}</strong>{" "}
                {isBn
                  ? "প্ল্যাটফর্মের নিরাপত্তা রক্ষণাবেক্ষণ, ওষুধের তালিকা ব্যবস্থাপনা এবং সিস্টেম সেটিংস নিয়ন্ত্রণ, প্রেসক্রিপশনে কোনো ক্লিনিকাল হস্তক্ষেপ ছাড়া।"
                  : "Platform infrastructure, formulary catalog maintenance, and role permission configurations without direct clinical tampering."}
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{isBn ? "৪. ডেটা স্টোরেজ, এনক্রিপশন ও ইন্ট্রানেট পরিচালনা" : "4. Data Storage, Encryption & Intranet Operation"}</span>
            </h2>
            <p>
              {isBn
                ? "পিপিএমএস ক্লাউড এবং হাসপাতালের অভ্যন্তরীণ উচ্চ-নিরাপত্তা ইন্ট্রানেট নেটওয়ার্কে নির্ভরযোগ্যভাবে পরিচালিত হয়:"
                : "PPMS is engineered to operate seamlessly across high-security hospital intranet environments as well as encrypted cloud infrastructures:"}
            </p>
            <div className="space-y-2 text-xs sm:text-sm">
              <p>
                • <strong>{isBn ? "ট্রানজিট এনক্রিপশন:" : "Encryption in Transit:"}</strong>{" "}
                {isBn
                  ? "সকল এইচটিটিপি যোগাযোগ TLS 1.3 দ্বারা সুরক্ষিত এবং নিরাপদ সেশন কুকিজ (`HttpOnly`, `SameSite=Lax`) ব্যবহার করে।"
                  : "All HTTP traffic is protected by Transport Layer Security (TLS 1.3) with encrypted session authentication cookies (`HttpOnly`, `SameSite=Lax`)."}
              </p>
              <p>
                • <strong>{isBn ? "পাসওয়ার্ড হ্যাশিং:" : "Credential Hashing:"}</strong>{" "}
                {isBn
                  ? "ব্যবহারকারীর পাসওয়ার্ড bcrypt অ্যালগরিদম দ্বারা সুরক্ষিত। কোনো প্লেইনটেক্সট পাসওয়ার্ড সংরক্ষণ করা হয় না।"
                  : "User passwords are encrypted using one-way adaptive bcrypt salt hashing. No plaintext credentials are ever written to disk."}
              </p>
              <p>
                • <strong>{isBn ? "অন-প্রিমিস ইন্ট্রানেট অপশন:" : "On-Premise Intranet Option:"}</strong>{" "}
                {isBn
                  ? "হাসপাতাল কর্তৃপক্ষ চাইলে সম্পূর্ণ পোস্টগ্রেসকিউএল ডাটাবেস হাসপাতালের লোকাল সার্ভারে চালাতে পারে।"
                  : "Hospital deployments may run the PostgreSQL database entirely within the hospital firewall with zero external telemetry."}
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{isBn ? "৫. রোগীর অধিকার ও তথ্যের নিয়ন্ত্রণ" : "5. Patient Rights & Data Control"}</span>
            </h2>
            <p>
              {isBn
                ? "চিকিৎসা নীতি এবং স্বাস্থ্য ডেটা প্রবিধানের অধীনে রোগীদের নিম্নলিখিত অধিকার রয়েছে:"
                : "Under medical ethics and data privacy regulations, patients hold the following rights:"}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                {isBn
                  ? "প্রদত্ত সকল প্রেসক্রিপশন এবং অ্যাপয়েন্টমেন্ট রেকর্ডের প্রিন্ট বা ডিজিটাল কপি পাওয়ার অধিকার।"
                  : "The right to obtain a printed or digital copy of all issued prescriptions and appointment records."}
              </li>
              <li>
                {isBn
                  ? "ভুল ব্যক্তিগত তথ্য (যেমন নামের বানান বা মোবাইল নম্বর) সংশোধনের অনুরোধ করার অধিকার।"
                  : "The right to request rectification of inaccurate personal details (e.g., misspelled name or incorrect contact phone)."}
              </li>
              <li>
                {isBn
                  ? "আইনগত মেডিকেল রেকর্ড সংরক্ষণের সময়সীমা সাপেক্ষে অ্যাকাউন্ট অ্যাক্সেস বাতিলের অধিকার।"
                  : "The right to request confidential deletion of account access credentials, subject to statutory medical record retention obligations."}
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{isBn ? "৬. ডেটা সুরক্ষা কর্মকর্তার (DPO) সাথে যোগাযোগ" : "6. Contact the Data Protection Officer (DPO)"}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {isBn
                ? "আপনার স্বাস্থ্য তথ্যের গোপনীয়তা সম্পর্কিত যেকোনো প্রশ্নের জন্য আমাদের হাসপাতাল ডেটা গভর্নেন্স ডেস্কে যোগাযোগ করুন:"
                : "If you have any questions regarding the confidentiality of your health data, or wish to exercise your patient rights, please contact our hospital data governance desk:"}
            </p>
            <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs space-y-1">
              <p><strong className="text-slate-900 dark:text-white">{isBn ? "হাসপাতাল ডেটা প্রোটেকশন অফিসার (DPO)" : "Hospital Data Protection Officer (DPO)"}</strong></p>
              <p>{settings.hospitalName} ({settings.hospitalBranch})</p>
              <p>{settings.hospitalAddress}</p>
              <p>{isBn ? "ইমেইল:" : "Email:"} <a href={`mailto:${settings.supportEmail}`} className="text-[var(--brand-text)] font-semibold underline">{settings.supportEmail}</a></p>
              <p>{isBn ? "ক্লিনিক্যাল হেল্পলাইন:" : "Clinical Helpline:"} {settings.contactPhone} • {isBn ? "জরুরি হটলাইন:" : "Emergency:"} {settings.emergencyHotline}</p>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}