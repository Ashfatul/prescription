"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Loader2,
} from "lucide-react";

function StripeDemoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();

  const appointmentId = searchParams.get("appointmentId") || "";
  const feeParam = searchParams.get("fee") || "50";
  const doctorName = searchParams.get("doctor") || "Specialist Physician";
  const serialNumber = searchParams.get("serial") || "1";
  const visitType = searchParams.get("visitType") || "NEW";

  const feeNumber = parseFloat(feeParam) || 50;

  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [expiry, setExpiry] = useState("12 / 28");
  const [cvc, setCvc] = useState("123");
  const [nameOnCard, setNameOnCard] = useState("Jane Doe");
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentId) {
      setErrorMessage("No appointment ID was provided in checkout parameters.");
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      const demoSessionId = `demo_stripe_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const res = await fetch(`/api/appointments/${appointmentId}/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: demoSessionId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to confirm payment with Stripe Sandbox");
      }

      setPaymentSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/patient?tab=overview&paid=true&appointment_id=${appointmentId}`);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment simulation failed";
      setErrorMessage(msg);
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      {/* Brand & Security Header */}
      <div className="w-full max-w-4xl mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/patient"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToPatientPortal}</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t("uiStripeEndToEndEncryption")}</span>
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 bg-[var(--bg-surface)] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl overflow-hidden">
        {/* Left Column: Order Summary & Doctor Details */}
        <div className="md:col-span-5 p-6 sm:p-8 bg-slate-50/70 dark:bg-slate-900/40 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-text)]">
                {t.consultationCheckout}
              </span>
              <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {t.confirmVisitingSerial}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {t.lockYourQueueTicket}
              </p>
            </div>

            {/* Doctor Card */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {doctorName}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold">
                  {visitType === "FOLLOWUP" ? t.followupVisit : t.firstVisit}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.reservedSerial} </span>
                <strong className="text-[var(--brand-text)] font-mono text-sm">
                  #{serialNumber}
                </strong>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t.physicianConsultation}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ${feeNumber.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t.hospitalTriageDigitalRx}</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  $0.00
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {t.totalDue}
                </span>
                <span className="text-2xl font-black font-mono text-[var(--brand-text)]">
                  ${feeNumber.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              {t.freeReportReviewWindow}
            </p>
          </div>
        </div>

        {/* Right Column: Stripe Payment Form */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800/70">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[var(--brand-primary)]" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {t.paymentMethod}
                </h2>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                {t.stripeSandboxMode}
              </span>
            </div>

            {/* Sandbox Notice Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{t.simulatedSandboxPayment}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/80">
                {t.stripeSandboxNotice}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                ⚠️ {errorMessage}
              </div>
            )}

            {paymentSuccess ? (
              <div className="py-12 text-center space-y-3 animate-in fade-in zoom-in-95">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {t.paymentSuccessful}
                </h3>
                <p className="text-xs text-slate-500">
                  {t.verifyingTransaction}
                </p>
              </div>
            ) : (
              <form onSubmit={handlePay} className="space-y-4">
                {/* Card Number */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t.cardNumber}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-app)] text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[var(--brand-primary)]"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                {/* Expiry and CVC */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {t.expirationDate}
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-app)] text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {t.cvcCvv}
                    </label>
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-app)] text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t.cardholderName}
                  </label>
                  <input
                    type="text"
                    value={nameOnCard}
                    onChange={(e) => setNameOnCard(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-app)] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 px-4 rounded-2xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-black text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t.verifyingWithStripe}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>
                          {language === "bn"
                            ? `স্ট্রাইপের মাধ্যমে $${feeNumber.toFixed(2)} পরিশোধ করুন (স্যান্ডবক্স টেস্ট)`
                            : `Pay $${feeNumber.toFixed(2)} via Stripe (Sandbox Test)`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
            <span>{t.poweredByStripe}</span>
            <Link
              href="/dashboard/patient"
              className="hover:underline text-slate-500 dark:text-slate-400"
            >
              {t.cancelAndReturn}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StripeDemoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary)]" />
        </div>
      }
    >
      <StripeDemoContent />
    </Suspense>
  );
}
