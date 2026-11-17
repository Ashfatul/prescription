"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Root Layout Error:", error);
  }, [error]);

  return (
    <html lang="en" className="h-full">
      <head>
        <title>System Interruption</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="w-full h-screen max-h-screen overflow-hidden m-0 font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        {/* Width-limited content with NO card background or visible border */}
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center">
          {/* Large Error Code */}
          <div className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter select-none leading-none text-red-600 dark:text-red-500">
            500
          </div>

          {/* Medium Error Message */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mt-5 sm:mt-6 mb-3">
            System Interruption
          </h1>

          {/* Normal Error Description */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed mb-2">
            An unexpected error occurred while rendering the application layout.
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 max-w-lg mx-auto leading-relaxed mb-8">
            অ্যাপ্লিকেশনের রুট লেআউটে একটি ত্রুটি ঘটেছে। দয়া করে পূর্ববর্তী পৃষ্ঠায় অথবা হোমপেজে ফিরে যান।
          </p>

          {/* Buttons: Return Homepage and Back Button */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98] min-h-[46px] no-underline"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Return to Homepage / হোমে ফিরুন</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") window.history.back();
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition-all active:scale-[0.98] cursor-pointer min-h-[46px]"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Go Back / ফিরে যান</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
