import { HeartPulse, Printer, ShieldCheck, Zap } from "lucide-react";

export default async function HeroRightTicketPreview() {
   return (
      <>
         {/* Right Column: Clean, Elegant Digital Prescription Studio Showcase */}
         <div className="lg:col-span-5 relative">
            {/* Floating Glow Ambient Pill */}
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-[var(--brand-primary)]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Floating Accolade Badge Top-Right */}
            <div className="absolute -top-4 -right-2 sm:-right-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-strong)]/40 shadow-md text-xs font-bold text-slate-800 dark:text-slate-200">
               <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
               <span>&lt; 20s Fast Prescribing</span>
            </div>

            {/* Floating Accolade Badge Bottom-Left */}
            <div className="absolute -bottom-4 -left-2 sm:-left-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-strong)]/40 shadow-md text-xs font-bold text-slate-800 dark:text-slate-200">
               <Printer className="w-4 h-4 text-[var(--brand-primary)]" />
               <span>BMDC Legal A4 Format</span>
            </div>

            {/* Main Hero Card Simulation: Clean Electronic Prescription */}
            <div className="relative z-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl overflow-hidden p-5 sm:p-6 space-y-4">
               {/* Card Header: Hospital & Chamber Identity */}
               <div className="flex items-start justify-between pb-3.5 border-b border-[var(--border-subtle)]">
                  <div className="space-y-1">
                     <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-primary)]" />
                        <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                           Metropolitan Specialized Hospital
                        </h2>
                     </div>
                     <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Dr. Fahim Rahman{" "}
                        <span className="font-normal text-slate-400">
                           • MBBS, FCPS (Medicine)
                        </span>
                     </p>
                     <p className="text-[10px] text-slate-400 font-mono">
                        BMDC Reg: A-54910 • Chamber 301
                     </p>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--brand-surface)] border border-[var(--brand-border)] text-[var(--brand-text)] text-[10px] font-bold">
                     <span>A4 Verified</span>
                  </div>
               </div>

               {/* Patient Demographic & Vitals Intake Bar */}
               <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <HeartPulse className="w-4 h-4 text-[var(--brand-primary)]" />
                        <span>Tariqul Islam</span>
                        <span className="text-slate-400 font-normal">
                           • 42y / Male
                        </span>
                     </div>
                     <span className="text-[10px] font-mono font-bold text-[var(--brand-text)] bg-[var(--brand-surface)] px-2 py-0.5 rounded-md">
                        #RX-82910
                     </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px]">
                     <div className="p-1.5 rounded-lg bg-[var(--bg-surface)] text-center border border-[var(--border-subtle)]">
                        <span className="block text-slate-400 font-medium">
                           BP
                        </span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">
                           120/80
                        </span>
                     </div>
                     <div className="p-1.5 rounded-lg bg-[var(--bg-surface)] text-center border border-[var(--border-subtle)]">
                        <span className="block text-slate-400 font-medium">
                           Pulse
                        </span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">
                           74 bpm
                        </span>
                     </div>
                     <div className="p-1.5 rounded-lg bg-[var(--bg-surface)] text-center border border-[var(--border-subtle)]">
                        <span className="block text-slate-400 font-medium">
                           SpO2
                        </span>
                        <span className="font-extrabold text-emerald-600">
                           99%
                        </span>
                     </div>
                     <div className="p-1.5 rounded-lg bg-[var(--bg-surface)] text-center border border-[var(--border-subtle)]">
                        <span className="block text-slate-400 font-medium">
                           Temp
                        </span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">
                           98.4°F
                        </span>
                     </div>
                  </div>
               </div>

               {/* 1-Click Chief Complaints & Diagnosis Preset Chips */}
               <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px]">
                     <span className="font-bold text-slate-700 dark:text-slate-300">
                        Diagnosis:
                     </span>
                     <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] font-semibold text-[10px]">
                        Acute Upper Respiratory Infection
                     </span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                     <span className="px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-slate-600 dark:text-slate-300 font-medium border border-[var(--border-subtle)]">
                        Fever x 3 days
                     </span>
                     <span className="px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-slate-600 dark:text-slate-300 font-medium border border-[var(--border-subtle)]">
                        Dry Cough
                     </span>
                     <span className="px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-slate-600 dark:text-slate-300 font-medium border border-[var(--border-subtle)]">
                        Throat Pain
                     </span>
                  </div>
               </div>

               {/* Rx Prescribed Medications (Clean, spacious list) */}
               <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                     <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="text-base font-serif italic font-bold text-[var(--brand-text)]">
                           ℞
                        </span>
                        <span>Prescribed Medications</span>
                     </span>
                     <span className="text-[10px] text-[var(--brand-text)] font-semibold">
                        Auto-Populated Dosage
                     </span>
                  </div>

                  <div className="space-y-2 text-xs">
                     <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                        <div>
                           <strong className="text-slate-900 dark:text-white font-bold block text-xs">
                              Tab. Napa Extra 500mg+65mg
                           </strong>
                           <span className="text-[10px] text-slate-500">
                              Paracetamol + Caffeine • After meal
                           </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold">
                           <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)]">
                              1+0+1
                           </span>
                           <span className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200">
                              5 Days
                           </span>
                        </div>
                     </div>

                     <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                        <div>
                           <strong className="text-slate-900 dark:text-white font-bold block text-xs">
                              Cap. Maxpro 20mg
                           </strong>
                           <span className="text-[10px] text-slate-500">
                              Esomeprazole • 30 mins before meal
                           </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold">
                           <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)]">
                              1+0+1
                           </span>
                           <span className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200">
                              14 Days
                           </span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Doctor Signature & Advice Footer */}
               <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
                  <div className="text-slate-500 text-[10px] max-w-[210px] truncate">
                     Advice: Complete bed rest, warm fluids.
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                     <ShieldCheck className="w-3.5 h-3.5" />
                     <span>Digitally Verified</span>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
}
