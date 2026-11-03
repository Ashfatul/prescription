"use client";

import { 
  AlertCircle, 
  PhoneCall, 
  Stethoscope, 
  Pill, 
  Microscope, 
  ShieldCheck, 
  HeartHandshake 
} from "lucide-react";
import { LegalNav } from "@/components/legal/legal-nav";
import { useLanguage } from "@/lib/i18n/language-context";
import { HospitalSettings } from "@/features/settings/settings.service";

export function DisclaimerView({ settings }: { settings: HospitalSettings }) {
  const { language } = useLanguage();
  const isBn = language === "bn";

  return (
    <>
      <LegalNav 
        title={isBn ? "মেডিকেল ডিসক্লেইমার ও প্রেসক্রিপশন মানদণ্ড" : "Medical Disclaimer & Prescribing Standards"} 
        lastUpdated={isBn ? "১ নভেম্বর, ২০২৬" : "November 1, 2026"} 
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-10 shadow-xs space-y-10 leading-relaxed text-sm text-slate-700 dark:text-slate-300">
          
          {/* High Priority Emergency Alert Banner */}
          <div className="p-6 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-900 dark:text-rose-200 space-y-3">
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 animate-bounce" />
              <h2 className="text-base sm:text-lg font-black tracking-tight text-rose-950 dark:text-white">
                {isBn ? "জরুরি চিকিৎসা সতর্কতা" : "EMERGENCY MEDICAL WARNING"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">
              <strong>{isBn ? "জরুরি চিকিৎসার প্রয়োজনে এই প্ল্যাটফর্ম ব্যবহার করবেন না।" : "DO NOT USE THIS PLATFORM FOR EMERGENCY MEDICAL CONDITIONS."}</strong>{" "}
              {isBn
                ? `যদি আপনি বা আপনার সাথে থাকা কেউ তীব্র বুকে ব্যথা, শ্বাসকষ্ট, অতিরিক্ত রক্তক্ষরণ, স্ট্রোকের লক্ষণ (মুখের অসাড়তা, কথা জড়িয়ে যাওয়া), চেতনা হ্রাস বা গুরুতর দুর্ঘটনার শিকার হন, তবে অবিলম্বে হাসপাতালের জরুরি হটলাইন ${settings.emergencyHotline}-এ কল করুন অথবা নিকটস্থ জরুরি ট্রমা সেন্টারে যোগাযোগ করুন।`
                : `If you or someone you are assisting is experiencing severe chest pain, shortness of breath, acute hemorrhage, signs of stroke (facial drooping, arm weakness, slurred speech), loss of consciousness, or severe trauma, immediately call the Hospital Emergency Hotline at ${settings.emergencyHotline} or go to the nearest emergency trauma center.`}
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{isBn ? "১. সফটওয়্যার টুল বনাম স্বাধীন চিকিৎসা সেবা" : "1. Software Tool vs. Independent Medical Practice"}</span>
            </h2>
            <p>
              {isBn
                ? "পেশেন্ট প্রেসক্রিপশন ম্যানেজমেন্ট সিস্টেম (পিপিএমএস) একটি প্রশাসনিক ও ক্লিনিক্যাল ওয়ার্কফ্লো সফটওয়্যার, যা নিবন্ধিত চিকিৎসক ও হাসপাতাল বিভাগগুলোকে প্রেসক্রিপশন তৈরি, পেজিনেশন ও প্রিন্ট করতে সহায়তা করে।"
                : "The Patient Prescription Management System (PPMS) is an administrative and clinical workflow tool designed to assist registered medical doctors and hospital departments in composing, formatting, paginating, and printing medical prescriptions."}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {isBn
                ? "এই প্ল্যাটফর্ম কোনো স্বয়ংক্রিয় রোগ নির্ণয় সেবা প্রদান করে না, কোনো নির্দিষ্ট চিকিৎসা নির্ধারণ করে না এবং লক্ষণ মূল্যায়ন করে না। প্রতিটি ক্লিনিক্যাল এন্ট্রি, রোগ নির্ণয়, ওষুধের মাত্রা এবং ডায়াগনস্টিক টেস্ট শুধুমাত্র লাইসেন্সপ্রাপ্ত চিকিৎসকের প্রত্যক্ষ সিদ্ধান্তে নির্ধারিত হয়।"
                : "The platform does not provide diagnostic services, recommend specific therapeutic courses, or evaluate individual patient symptoms. Every clinical entry, diagnosis, pharmaceutical prescription, dosage, and diagnostic test order is made solely and exclusively by the examining licensed physician."}
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{isBn ? "২. ওয়েবসাইট ব্রাউজিংয়ের মাধ্যমে ডাক্তার-রোগী সম্পর্ক তৈরি হয় না" : "2. No Doctor-Patient Relationship Established by Browsing"}</span>
            </h2>
            <p>
              {isBn
                ? "ওয়েবসাইট ব্রাউজ করা, চিকিৎসকদের চেম্বারের সময়সূচী দেখা বা পাবলিক ডিরেক্টরি দেখার মাধ্যমে কোনো ডাক্তার-রোগী আইনি সম্পর্ক প্রতিষ্ঠিত হয় না।"
                : "Accessing this website, browsing the public consulting physicians directory, reviewing chamber visiting hours, or inspecting public API feeds does not create a doctor-patient relationship between you and any listed medical specialist."}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {isBn
                ? "শুধুমাত্র চিকিৎসকের চেম্বারে বা অনুমোদিত টেলিমেডিসিন পরামর্শ আনুষ্ঠানিকভাবে শুরু হলেই ডাক্তার-রোগী আইনি সম্পর্ক গঠিত হয়।"
                : "A legally recognized doctor-patient relationship is established only upon the formal commencement of a clinical consultation within the doctor's physical chamber or authorized hospital teleconsultation block."}
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{isBn ? "৩. ফার্মাসিউটিক্যাল ফর্মুলারি ও প্রিসেট ডোজের সীমাবদ্ধতা" : "3. Pharmaceutical Formulary & Default Dose Presets"}</span>
            </h2>
            <p>
              {isBn
                ? "সিস্টেমের ফর্মুলারিতে প্রমিত ওষুধের নাম, ড্রাগ ফরম্যাট (ট্যাবলেট/ক্যাপসুল) এবং ডিফল্ট সেবনবিধি (যেমন 'খাবারের পর ১+০+১') চিকিৎসকদের দ্রুত টাইপিংয়ের সুবিধার জন্য প্রিসেট আকারে সংরক্ষিত।"
                : "The system formulary provides standard catalog information (generic names, dosage forms such as Tablet or Capsule, default directions such as \"1+0+1 after meal\") as a convenience to reduce repetitive typing for clinicians."}
            </p>
            <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs space-y-2">
              <p>
                • <strong>{isBn ? "চিকিৎসকের দায়িত্ব:" : "Physician Obligation:"}</strong>{" "}
                {isBn
                  ? "রোগীর বয়স, শরীরের ওজন, কিডনি বা লিভারের কার্যক্ষমতা, গর্ভাবস্থা এবং অন্যান্য ওষুধের মিথস্ক্রিয়া বিবেচনা করে সঠিক ডোজ ও সময়কাল যাচাই করা চিকিৎসকের একান্ত দায়িত্ব।"
                  : "The prescribing physician must review and verify all dosages, frequencies, and administration durations for each specific patient, considering age, body surface area, renal or hepatic function, pregnancy status, and potential drug interactions."}
              </p>
              <p>
                • <strong>{isBn ? "ফার্মাসিস্টদের করণীয়:" : "Dispensing Pharmacists:"}</strong>{" "}
                {isBn
                  ? "প্রেসক্রিপশন অনুযায়ী ওষুধ বিতরণের পূর্বে চিকিৎসকের বিএমডিসি রেজিস্ট্রেশন সিল এবং তারিখ যাচাই করা ফার্মাসিস্টদের পেশাদার দায়িত্ব।"
                  : "Pharmacists dispensing medications based on PPMS prescriptions must verify the prescription's BMDC registration seal and date before dispensing scheduled substances."}
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Microscope className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{isBn ? "৪. ডায়াগনস্টিক পরীক্ষা ও সংযুক্ত ল্যাব রিপোর্ট" : "4. Diagnostic Investigations & Attached Lab Reports"}</span>
            </h2>
            <p>
              {isBn
                ? "প্রেসক্রিপশন এডিটরে সংযুক্ত ডিজিটাল রিপোর্ট ও রেডিওলজি স্ক্যান (এক্স-রে, সিটি, এমআরআই) শুধুমাত্র চিকিৎসকের রেফারেন্সের জন্য সংরক্ষিত।"
                : "Digital documents, radiology scans (X-Ray, CT, MRI), and pathology reports uploaded into the prescription editor are archival representations provided for clinical reference."}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                {isBn
                  ? "ডিজিটাল স্ক্যানের স্বচ্ছতা ডিভাইসের স্ক্রিন রেজোলিউশন ও আপলোড করা ফাইলের মানের ওপর নির্ভর করে।"
                  : "Digital scan rendering fidelity depends on client screen resolution and the quality of the uploaded source file."}
              </li>
              <li>
                {isBn
                  ? "চূড়ান্ত চিকিৎসা সিদ্ধান্তের জন্য অনুমোদিত ডায়াগনস্টিক সেন্টারের মূল স্বাক্ষরিত ল্যাব রিপোর্টের ওপর নির্ভর করা উচিত।"
                  : "Definitive clinical decisions must be supported by official signed laboratory diagnostic reports from accredited diagnostic facilities."}
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span>{isBn ? "৫. রোগীর নিয়ম মেনে চলা ও ওষুধের পার্শ্বপ্রতিক্রিয়া প্রোটোকল" : "5. Patient Adherence & Adverse Drug Reaction Protocol"}</span>
            </h2>
            <p>
              {isBn
                ? "পিপিএমএস দ্বারা তৈরি প্রেসক্রিপশন গ্রহণকারী রোগীদের পরামর্শ দেওয়া হচ্ছে:"
                : "Patients receiving prescriptions generated via PPMS are advised to:"}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                {isBn
                  ? "চিকিৎসকের নির্দেশনা সঠিকভাবে অনুসরণ করুন; নিজের ইচ্ছায় ডোজ পরিবর্তন বা অ্যান্টিবায়োটিক সেবন অকালে বন্ধ করবেন না।"
                  : "Follow the physician's directions precisely without altering doses or discontinuing antibiotics prematurely."}
              </li>
              <li>
                {isBn
                  ? "ওষুধের প্যাকেটের সতর্কতা ও ফার্মেসির নির্দেশনা মনোযোগ সহকারে পড়ুন।"
                  : "Read all package inserts and contraindication warnings provided by the dispensing pharmacy."}
              </li>
              <li>
                {isBn
                  ? "অপ্রত্যাশিত পার্শ্বপ্রতিক্রিয়া, চামড়ায় লাল ফুসকুড়ি, মুখ ফুলে যাওয়া বা শ্বাসকষ্ট দেখা দিলে অবিলম্বে ওষুধ বন্ধ করে জরুরি চিকিৎসা নিন।"
                  : "In the event of unexpected side effects, cutaneous rash, facial swelling, or breathing difficulties, immediately discontinue the medication and seek emergency medical care."}
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{isBn ? "৬. নিয়ন্ত্রক মানদণ্ড ও বিএমডিসি সম্মতি" : "6. Regulatory Compliance & Accreditation"}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {isBn
                ? "পিপিএমএস দ্বারা তৈরি সকল প্রেসক্রিপশন ফরম্যাট ও চিকিৎসকের সনদ ব্লক বাংলাদেশ মেডিকেল অ্যান্ড ডেন্টাল কাউন্সিল (বিএমডিসি)-এর নির্দেশিকা অনুসরণ করে তৈরি, যা চিকিৎসকের পদবী, রেজিস্ট্রেশন আইডি, রোগীর পরিচিতি এবং আইনি স্বাক্ষর ব্লকের যথাযথ উপস্থাপন নিশ্চিত করে।"
                : "All prescription layouts and doctor credential blocks generated by PPMS comply with the standard guidelines set forth by the Bangladesh Medical & Dental Council (BMDC), ensuring proper display of physician degrees, registration identifiers, clinical notes, patient identification numbers, and legal signature areas."}
            </p>
          </section>

        </div>
      </main>
    </>
  );
}