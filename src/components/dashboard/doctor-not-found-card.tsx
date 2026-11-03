"use client";

import { AlertCircle } from "lucide-react";
import { Card } from "@/components/common/card";
import { useLanguage } from "@/lib/i18n/language-context";

export function DoctorNotFoundCard() {
  const { language } = useLanguage();

  return (
    <Card className="max-w-xl mx-auto my-12 p-8 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
        <AlertCircle className="w-7 h-7" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {language === "bn" ? "চিকিৎসকের প্রোফাইল পাওয়া যায়নি" : "Doctor Profile Not Found"}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {language === "bn"
            ? "আপনার ব্যবহারকারী অ্যাকাউন্টটি কোনো চিকিৎসক রেকর্ডের সাথে সংযুক্ত নয়। অনুগ্রহ করে সিস্টেম অ্যাডমিনিস্ট্রেটরের সাথে যোগাযোগ করুন।"
            : "Your user account is not linked to a doctor record. Please contact the administrator."}
        </p>
      </div>
    </Card>
  );
}
