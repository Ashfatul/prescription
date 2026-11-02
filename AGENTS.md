# AGENTS.md - Clinical Dashboard & Prescription System Architecture & Style Guide

Welcome to the **Patient Prescription Management System (PPMS)** codebase. This document defines the engineering standards, visual architecture, ergonomic requirements, and workflow conventions for all developers and AI agents working on this repository.

---

## 1. Visual Architecture & Design Principles

### 1.1 Non-Compact, Spacious & Comfortable UI
- **Never use cramped or wireframe-like interfaces.** Doctors and clinical staff spend hours entering patient details and reviewing charts; the UI must feel spacious, modern, easy on the eyes, and ergonomic.
- Cards, panels, and modal dialogs should use generous padding (`p-5`, `p-6`, or `p-8`), rounded corners (`rounded-2xl` or `rounded-3xl`), and subtle elevation shadows (`var(--shadow-card)`).
- Visual hierarchy should be crisp: prominent titles (`text-xl font-bold tracking-tight`), distinct badges, clear field labels (`text-xs font-semibold uppercase tracking-wider text-slate-500`), and generous touch/click targets (`min-h-[42px]` or `min-h-[48px]`).

### 1.2 Strict Semantic Color System (No Hardcoded Theme Colors)
- **Rule**: All background surfaces, borders, text, and brand colors MUST be derived from semantic CSS tokens defined in `src/app/globals.css`.
- **Light & Dark Theme Consistency**: Every screen must look equally refined in both light mode and dark mode. Never apply a light background without pairing it with an appropriate dark counterpart.
- **Key Tokens**:
  | Token | Purpose | Light Value | Dark Value |
  | :--- | :--- | :--- | :--- |
  | `--bg-app` | App canvas background | `#f8fafc` | `#080c15` |
  | `--bg-surface` | Primary card / panel surface | `#ffffff` | `#0f172a` |
  | `--bg-elevated` | Dropdown, popover, modal surface | `#ffffff` | `#162035` |
  | `--bg-subtle` | Secondary chip / muted background | `#f1f5f9` | `#1e293b` |
  | `--text-primary` | High contrast primary text | `#0f172a` | `#f8fafc` |
  | `--text-secondary` | Informative body / label text | `#475569` | `#94a3b8` |
  | `--text-muted` | Tertiary hints / timestamp text | `#64748b` | `#64748b` |
  | `--border-subtle` | Minimal structural divider | `#e2e8f0` | `#1e293b` |
  | `--border-default` | Standard input / card border | `#cbd5e1` | `#334155` |
  | `--border-strong` | Active focus / prominent border | `#94a3b8` | `#475569` |
  | `--brand-primary` | Main interactive brand accent | Varies (default Teal `#0f766e`) | Varies (Teal `#14b8a6`) |
  | `--brand-surface` | Brand tinted background for chips | `#f0fdfa` | `rgba(20, 184, 166, 0.12)` |

### 1.3 Dynamic Accent Palettes
- The application supports 5 accent themes via the `data-accent` attribute on `<html>` (`localStorage: ppms-accent`):
  1. `teal` (default clinical teal)
  2. `blue` (sapphire clinical blue)
  3. `indigo` (modern indigo)
  4. `rose` (rose vibrant)
  5. `slate` (clean monochrome slate)
- Always use `var(--brand-primary)`, `var(--brand-surface)`, and `var(--brand-text)` when styling active tabs, submit buttons, badges, and focus rings so user customizations reflect universally.

### 1.4 Strict Standard: Common Selector Everywhere (Zero Native `<select>` Rule)
- **STRICT PROHIBITION**: Never use raw, unstyled native HTML `<select>` elements anywhere in the application.
- **Rule**: All select dropdowns, directory filters, sort controls, modal dropdowns, and form inputs MUST use `CustomSelect` (or `SearchableSelect`) imported from `@/components/common/custom-select`.
- **Sizes**:
  - `size="md"` (default): For standard form fields and modal inputs (`min-h-[46px] sm:min-h-[48px]`, `text-sm`).
  - `size="sm"`: For toolbar strips, directory search bars, and compact filter bars (`min-h-[38px] h-[38px]`, `text-xs`).
- **Options & Clearing**:
  - Mandatory / Sort selections: pass `allowClear={false}` so selections cannot be accidentally cleared to an empty string.
  - Search toggle: set `searchable={false}` for short lists (<= 5 items); set `searchable={true}` for large rosters.
- **Standard Usage Pattern**:
  ```tsx
  import { CustomSelect } from "@/components/common/custom-select";

  // In a form row:
  <CustomSelect
    label="Follow-up Validity"
    value={validityDays}
    onChange={(val) => setValidityDays(val)}
    options={[
      { value: "30", label: "30 Days (1 Month)" },
      { value: "60", label: "60 Days (2 Months)" },
      { value: "90", label: "90 Days (3 Months)" },
    ]}
    allowClear={false}
    searchable={false}
  />

  // In a toolbar / filter strip:
  <div className="w-48">
    <CustomSelect
      size="sm"
      value={sortBy}
      onChange={(val) => setSortBy(val)}
      options={[
        { value: "recent", label: "Recently Added" },
        { value: "alpha", label: "Alphabetical (A - Z)" },
      ]}
      allowClear={false}
      searchable={false}
    />
  </div>
  ```

---

## 2. Doctor Ergonomics & Fast Prescribing Principles

Doctors operate under intense time constraints. The prescription writing process must prioritize zero-redundancy interactions:

1. **Searchable Selects with Auto-population**:
   - Never force doctors to manually type repetitive medicine strengths or directions.
   - Use `SearchableSelect` connected to the medicine catalog (`/api/medicines`).
   - Selecting a medicine like `"Maxpro 20mg"` must automatically fill:
     - Type: `"Capsule"`
     - Strength: `"20mg"`
     - Default Dose: `"1+0+1"`
     - Default Timing: `"30 mins before meal"`
     - Duration: `"14 days"`
2. **One-Click Clinical Chips (Presets)**:
   - Provide quick 1-click chip buttons for common Chief Complaints (e.g. *Fever x 3 days*, *Dry cough*, *Throat pain*, *Epigastric distress*).
   - Provide 1-click chips for Common Diagnoses (e.g. *Upper Respiratory Infection*, *Acute Gastritis*, *Essential Hypertension*).
   - Provide 1-click chips for Dose Frequencies (`1+0+1`, `1+1+1`, `0+0+1`, `1+0+0`) and Durations (`3 days`, `5 days`, `7 days`, `14 days`, `1 month`).
   - Provide 1-click chips for Lifestyle Advice (*Drink plenty of warm water*, *Avoid oily and spicy foods*, *Take complete bed rest*).
3. **Dedicated Catalog Management Hub**:
   - Medicines and Diagnostic Tests are managed centrally via the Admin/Doctor Catalog Hub (`/dashboard/admin` and `CatalogManager`).
   - Doctors can also create custom medicines or tests inline on the fly if an item isn't in the global list.

---

## 3. Prescription Printing & Live Preview Standard

1. **Multi-Page Support**:
   - Prescriptions that exceed one page (e.g., long medication lists, detailed lab tests, clinical advice) MUST cleanly paginate.
   - The clinic/hospital header (hospital name, address, contact, emergency phone) and doctor credentials (degrees, BMDC registration number, chamber info) must be repeated on each page.
   - The patient information bar (name, age, gender, date, Rx ID) must appear at the top of each page.
   - The bottom of each page must display page numbering (e.g., *Page 1 of 2*) and the legal doctor signature block.
2. **Live Preview Modal**:
   - Before printing or saving, doctors must be able to click **"Live Preview"** to open a true-to-life modal overlay replicating the exact A4 layout.

---

## 4. Technical Stack & Conventions

- **Framework**: Next.js 16.2.4 (App Router) + React 19 + TypeScript.
- **PWA & Mobile**: Progressive Web App with `manifest.ts` (`/manifest.webmanifest`), `public/sw.js` offline caching, and complete favicon suite (`public/icons/`).
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"; @theme inline;`).
- **Database**: PostgreSQL with Prisma ORM (`prisma/schema.prisma`).
- **Authentication**: JWT cookies (`ppms_session`), role-based authorization (`SUPER_ADMIN`, `DOCTOR`, `PATIENT`, `STAFF`).
- **Environment**:
  - `DATABASE_URL` (PostgreSQL)
  - `JWT_SECRET`
  - `NEXT_PUBLIC_DEMO_MODE="true"` (enables instant quick logins on `/auth/login`)

---

## 5. Verification Checklist for Agents

Before completing any task modifying UI or backend:
1. `npx tsc --noEmit` must pass with 0 errors.
2. `npm run lint` must pass with 0 errors.
3. Confirm zero native `<select>` tags (`git grep "<select"` must return 0 results). Always use `CustomSelect`.
4. Test both **Light Mode** and **Dark Mode** to ensure no illegible text, unstyled borders, or jarring white/black patches.
5. Confirm responsive behavior across mobile, tablet, and desktop viewports.
