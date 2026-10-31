"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700"
    >
      <span>🖨️</span>
      <span>Print / Save as PDF</span>
    </button>
  );
}
