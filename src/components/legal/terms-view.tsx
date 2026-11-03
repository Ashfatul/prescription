"use client";

import { 
  Scale, 
  Stethoscope, 
  AlertTriangle, 
  UserCheck, 
  CalendarCheck, 
  ShieldAlert, 
  Building2 
} from "lucide-react";
import { LegalNav } from "@/components/legal/legal-nav";
import { useLanguage } from "@/lib/i18n/language-context";

export function TermsView() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  return (
    <>
      <LegalNav 
        title={isBn ? "সেবার শর্তাবলী ও ক্লিনিক্যাল ব্যবহারের চুক্তি" : "Terms of Service & Clinical Usage Agreement"} 
        lastUpdated={isBn ? "১ নভেম্বর, ২০২৬" : "November 1, 2026"} 
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-10 shadow-xs space-y-10 leading-relaxed text-sm text-slate-700 dark:text-slate-300">
          
          {/* Executive Summary Callout */}
          <div className="p-5 rounded-2xl bg-[var(--brand-surface)] border border-[var(--brand-border)]/60 text-xs text-[var(--brand-text)] flex items-start gap-3.5">
            <Scale className="w-5 h-5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-sm font-bold text-[var(--text-primary)]">
                {isBn ? "ক্লিনিক্যাল প্ল্যাটফর্ম ব্যবহারের সারসংক্ষেপ" : "Clinical Platform Usage Summary"}
              </strong>
              <p className="leading-relaxed">
                {isBn
                  ? "পেশেন্ট প্রেসক্রিপশন ম্যানেজমেন্ট সিস্টেম (পিপিএমএস) ব্যবহারের মাধ্যমে চিকিৎসক, প্রশাসনিক কর্মী এবং রোগীবৃন্দ এই শর্তাবলীর সাথে একমত পোষণ করছেন। নিবন্ধিত চিকিৎসকরা তাদের প্রদত্ত প্রেসক্রিপশন ও রোগ নির্ণয়ের ব্যাপারে একক ও সম্পূর্ণ আইনি দায়িত্ব বহন করেন।"
                  : "By accessing or using the Patient Prescription Management System (PPMS), physicians, administrative staff, and patients agree to be bound by these Terms of Service. Registered doctors remain exclusively responsible for their clinical diagnostic determinations and drug prescriptions."}
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{isBn ? "১. চিকিৎসকের সনদ ও বিএমডিসি সনদ সংক্রান্ত বাধ্যবাধকতা" : "1. Physician Licensure & BMDC Credential Requirements"}</span>
            </h2>
            <p>
              {isBn
                ? "পিপিএমএস প্রেসক্রিপশন মডিউলটি শুধুমাত্র বাংলাদেশ মেডিকেল অ্যান্ড ডেন্টাল কাউন্সিল (বিএমডিসি) বা স্বীকৃত জাতীয় নিয়ন্ত্রক সংস্থার নিবন্ধিত চিকিৎসকদের জন্য উন্মুক্ত।"
                : "The prescription authoring module within PPMS is restricted exclusively to duly licensed medical practitioners registered with the Bangladesh Medical & Dental Council (BMDC) or equivalent national statutory medical licensing authorities."}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                {isBn
                  ? "চিকিৎসকদের তাদের যাচাইকৃত বিএমডিসি রেজিস্ট্রেশন নম্বর, প্রাতিষ্ঠানিক ডিগ্রি এবং চেম্বারের ঠিকানা প্রদান করতে হবে।"
                  : "Physicians must provide their verified BMDC registration number, academic degrees, and chamber affiliation."}
              </li>
              <li>
                {isBn
                  ? "ভুয়া পরিচিতি ব্যবহার করা বা অন্যের বিএমডিসি নম্বর দিয়ে প্রেসক্রিপশন ইস্যু করা আইনত দণ্ডনীয় অপরাধ এবং তাৎক্ষণিক অ্যাকাউন্ট বাতিলের কারণ।"
                  : "Impersonating a licensed doctor or issuing prescriptions using another clinician's credentials is a criminal offense and grounds for immediate account termination and legal reporting."}
              </li>
              <li>
                {isBn
                  ? "প্রেসক্রিপশনে ব্যবহৃত ডিজিটাল স্বাক্ষর সংশ্লিষ্ট চিকিৎসকের আইনসম্মত অনুমোদন হিসেবে গণ্য হবে।"
                  : "The physician's digital signature and legal stamp applied on issued prescriptions constitute legal authorization by that specific practitioner."}
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>{isBn ? "২. স্বাধীন চিকিৎসা মূল্যায়ন ও ডিসিশন সাপোর্ট টুলস" : "2. Independent Medical Judgment & Decision Support"}</span>
            </h2>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
              <strong>{isBn ? "গুরুত্বপূর্ণ আইনি বিজ্ঞপ্তি:" : "CRITICAL LEGAL NOTICE:"}</strong>{" "}
              {isBn
                ? "পিপিএমএস একটি ক্লিনিকাল ও চেম্বার ডকুমেন্টেশন সফটওয়্যার। এটি স্বয়ংক্রিয় চিকিৎসা পরামর্শ দেয় না বা চিকিৎসকের পেশাদার সিদ্ধান্তের বিকল্প নয়।"
                : "PPMS is a clinical management software and documentation tool. It does not practice medicine, provide medical advice, or replace the professional diagnostic judgment of a qualified doctor."}
            </div>
            <p>
              {isBn
                ? "সফটওয়্যারের ড্রাগ ফর্মুলারি থেকে স্বয়ংক্রিয় ওষুধের পরামর্শ, ডোজ ফ্রিকোয়েন্সি চিপস (`১+০+১`), খাবারের সময় এবং পরীক্ষার তালিকা শুধুমাত্র সুবিধাজনক ব্যবহারের সহায়ক টুলস হিসেবে কাজ করে।"
                : "All auto-populated pharmaceutical suggestions, pre-configured dosage frequency chips (`1+0+1`, `1+1+1`), default meal timings, duration presets, and diagnostic test templates provided by the formulary are clinical convenience tools only."}
            </p>
            <p>
              {isBn
                ? "প্রেসক্রিপশনকারী চিকিৎসক রোগীর ব্যক্তিগত স্বাস্থ্য বিবেচনা করে সঠিক ওষুধ, মাত্রা, পার্শ্বপ্রতিক্রিয়া এবং ড্রাগ মিথস্ক্রিয়া যাচাই করার সম্পূর্ণ আইনি দায় বহন করেন।"
                : "The prescribing physician bears sole, non-delegable legal liability to ensure that the medication, strength, route, frequency, contraindications, and drug-drug interactions are clinically indicated, appropriate, and safe for the individual patient."}
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{isBn ? "৩. অ্যাপয়েন্টমেন্ট, সিরিয়াল টোকেন ও চেম্বার কিউ নিয়মাবলী" : "3. Appointments, Serial Tokens & Chamber Queue Rules"}</span>
            </h2>
            <p>
              {isBn
                ? "রোগী ও অভ্যর্থনা কর্মীরা শিডিউলিং মডিউল ব্যবহারের ক্ষেত্রে নিম্নলিখিত নিয়মে আবদ্ধ থাকবেন:"
                : "Patients and hospital receptionists utilizing the appointment scheduling module agree to the following operational terms:"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {isBn ? "সিরিয়াল বরাদ্দ" : "Serial Allocation"}
                </span>
                <p className="text-slate-500">
                  {isBn
                    ? "ডাক্তারের চেম্বারের সময়সূচী অনুযায়ী 'আগে আসলে আগে পাবেন' ভিত্তিতে সিরিয়াল টোকেন ইস্যু করা হয়।"
                    : "Queue tokens are assigned sequentially on a first-come, first-served basis according to doctor visiting hours."}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {isBn ? "জরুরি ট্রায়াজ অগ্রাধিকার" : "Emergency Triage Override"}
                </span>
                <p className="text-slate-500">
                  {isBn
                    ? "চেম্বার চিকিৎসক ও ট্রায়াজ নার্সরা জরুরি ও মুমূর্ষু রোগীকে নিয়মিত সিরিয়ালের পূর্বে চিকিৎসা দেয়ার পূর্ণ ক্ষমতা রাখেন।"
                    : "Chamber physicians and triage nurses reserve the absolute right to prioritize emergency and critical trauma patients ahead of regular tokens."}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {isBn ? "সময়মতো উপস্থিতি" : "Timely Arrival"}
                </span>
                <p className="text-slate-500">
                  {isBn
                    ? "রোগীদেরকে তাদের আনুমানিক সিরিয়াল ডাকার সময়ের অন্তত ১৫ মিনিট আগে হাসপাতালে উপস্থিত থাকার পরামর্শ দেয়া হয়।"
                    : "Patients are advised to check in at the reception desk at least 15 minutes before their estimated serial call time."}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {isBn ? "বাতিল ও পুনঃনির্ধারণ" : "Cancellation & Rescheduling"}
                </span>
                <p className="text-slate-500">
                  {isBn
                    ? "পরামর্শ শুরুর পূর্বে রোগী পোর্টাল বা ফ্রন্ট ডেস্কের মাধ্যমে অ্যাপয়েন্টমেন্ট বাতিল বা পরিবর্তন করা সম্ভব।"
                    : "Appointments may be cancelled via the patient portal or front desk prior to doctor chamber consultation commencement."}
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{isBn ? "৪. অ্যাকাউন্ট নিরাপত্তা ও নিষিদ্ধ কার্যক্রম" : "4. Account Security & Prohibited Activities"}</span>
            </h2>
            <p>
              {isBn
                ? "ব্যবহারকারীরা তাদের লগইন তথ্যের নিরাপত্তার জন্য দায়ী থাকবেন। নিম্নলিখিত কাজগুলো সম্পূর্ণ নিষিদ্ধ:"
                : "Users are responsible for safeguarding their login credentials. The following actions are strictly prohibited:"}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                {isBn
                  ? "অননুমোদিত ব্যক্তিদের সাথে চিকিৎসকের আইডি বা পাসওয়ার্ড শেয়ার করা।"
                  : "Sharing doctor credentials or staff authentication sessions across multiple unauthorized individuals."}
              </li>
              <li>
                {isBn
                  ? "ভূমিকাভিত্তিক নিরাপত্তা ব্যবস্থা লঙ্ঘনের চেষ্টা করা অথবা প্রেসক্রিপশন ও সিল জালিয়াতি করা।"
                  : "Attempting to bypass role-based permission checks, tamper with prescription records, or forge digital signature stamps."}
              </li>
              <li>
                {isBn
                  ? "অননুমোদিতভাবে স্বাস্থ্য তথ্য স্ক্র্যাপ করা বা হাসপাতাল প্রোটোকলের বাইরে রপ্তানি করা।"
                  : "Bulk scraping or exporting patient health data outside authorized hospital clinical workflows."}
              </li>
              <li>
                {isBn
                  ? "সিস্টেমে কোনো ক্ষতিকারক সফটওয়্যার স্থাপন বা সার্ভারের কার্যক্রমে বাধা সৃষ্টি করা।"
                  : "Injecting malicious software or interfering with system chamber queue operations."}
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{isBn ? "৫. দায়বদ্ধতার সীমাবদ্ধতা ও সেবার প্রাপ্যতা" : "5. Limitation of Liability & Service Availability"}</span>
            </h2>
            <p>
              {isBn
                ? "পিপিএমএস ৯৯.৯% আপটাইম বজায় রাখতে সচেষ্ট এবং ইন্টারনেট সংযোগ বিচ্ছিন্ন হলেও লোকাল ইন্ট্রানেটে নিরবচ্ছিন্ন সেবা প্রদানে সক্ষম। তবে:"
                : "PPMS maintains a targeted availability of 99.9% uptime and provides local intranet deployment capabilities to withstand internet service interruptions. However:"}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {isBn
                ? "আইন দ্বারা অনুমোদিত সর্বোচ্চ সীমা পর্যন্ত, কোনো ক্লিনিকাল ফলাফল, ভুল রোগ নির্ণয়, ওষুধ বিতরণে ফার্মেসির ত্রুটি বা হাসপাতালের বিদ্যুৎ/নেটওয়ার্ক সমস্যার জন্য প্ল্যাটফর্ম টিম দায়ী থাকবে না।"
                : "To the maximum extent permitted by applicable law, PPMS and its software engineering team shall not be liable for any direct, indirect, incidental, or consequential damages arising from clinical treatment outcomes, misdiagnosis, pharmaceutical dispensing errors, or power/telecommunication outages at hospital premises."}
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{isBn ? "৬. প্রযোজ্য আইন ও বিরোধ নিষ্পত্তি" : "6. Governing Law & Dispute Resolution"}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {isBn
                ? "এই শর্তাবলী গণপ্রজাতন্ত্রী বাংলাদেশের আইন, বিএমডিসি আইন এবং জাতীয় স্বাস্থ্যসেবা মানদণ্ড অনুযায়ী পরিচালিত ও নিয়ন্ত্রিত হবে। যেকোনো বিরোধ নিষ্পত্তির ক্ষেত্রে ঢাকা, বাংলাদেশের আদালত একক এখতিয়ার রাখবে।"
                : "These Terms shall be governed by and construed in accordance with the laws of the People's Republic of Bangladesh, the Medical and Dental Council Act, and national clinical practice standards. Any disputes shall be subject to the exclusive jurisdiction of the competent courts of Dhaka, Bangladesh."}
            </p>
          </section>

        </div>
      </main>
    </>
  );
}