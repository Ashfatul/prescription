# PPMS Project Analysis Report

**Analysis date:** 2026-11-03  
**Scope:** Repository structure, documented product scope, implementation inventory, validation checks, and notable risks.  
**Change policy:** No application source code was changed. This report is the only file created by this analysis.

## 1. What this project is

PPMS (Patient Prescription Management System) is a full-stack, multi-tenant clinical operations platform for clinics, chambers, and hospitals. It combines:

- Doctor prescription writing and revision history
- Patient records, diagnostic reports, reminders, and sharing
- Appointment booking, fees, payments, cancellation, and refunds
- Doctor serial queues and reception/triage workflows
- Admin organization, user, catalog, announcement, template, and audit management
- Public clinic/doctor directories and a privacy-masked waiting-room queue
- SaaS subscription plans and clinic-level organization isolation

The primary users are **Super Admins, clinic admins, doctors, front-desk staff, and patients**.

## 2. Main user journeys

### Doctor

1. Select a patient from the queue.
2. Record complaints, diagnosis, vitals, clinical information, medicines, tests, and advice.
3. Use catalog auto-fill and quick clinical presets.
4. Save, revise, preview, print, or share a prescription.
5. Generate medicine reminders and leave an audit trail.

### Patient

1. Find a doctor or clinic.
2. Book a consultation and select a payment path.
3. Track appointment/serial information.
4. View prescriptions, versions, reports, reminders, announcements, and approved chat.
5. Upload reports or use a public prescription link/QR code when enabled.

### Staff and clinic administration

1. Register or verify patients and issue walk-in serials.
2. Complete triage and manage the live queue.
3. Confirm/cancel appointments and record payment/refund information.
4. Manage users, doctors, medicine/test catalogs, schedules, templates, announcements, and subscriptions.

## 3. Technology and architecture

| Area | Observed implementation |
|---|---|
| Web framework | Next.js 16.2.4 App Router, React 19, TypeScript |
| Styling | Tailwind CSS v4 with semantic CSS variables in `src/app/globals.css` |
| Database | PostgreSQL through Prisma 6.17.1 |
| Authentication | JWT in an HTTP-only `ppms_token` cookie, with legacy `ppms_session` lookup support |
| Authorization | Role-based route guards plus organization-scoped service/API checks |
| Payments | Stripe Checkout/webhooks plus a local Stripe demo/sandbox flow |
| File storage | Cloudinary when configured, otherwise `public/uploads` local fallback |
| Email | Nodemailer-backed mailer and configurable email templates |
| UI state | React client components, server-rendered pages, `next-themes`, language context |
| Localization | English and Bengali dictionaries in `src/lib/i18n/dictionary.ts` |
| PWA | App manifest, icons, service worker, and registration component |
| Runtime configuration | `.env` values for database, JWT, mail, Cloudinary, Stripe, branding, and demo mode |

### Request and data flow

`src/proxy.ts` handles subdomain tenant context, dashboard protection, prescription route protection, and unauthenticated API rejection. API route handlers generally use `withErrorHandling`, `requireUser`, Zod schemas, feature services, and Prisma. Feature services contain the main business rules, while `src/components` contains the dashboard and public UI.

## 4. Implementation inventory

Measured from the current working tree:

- 235 source files under `src`
- Approximately 52,096 TypeScript/TSX lines
- 79 API route files
- 23 page files
- 64 component files
- 30 feature/service files
- 23 Prisma models
- 6 Prisma enums
- 0 native `<select>` elements found in application source
- No test files or test script found in the repository

### Core data model

The schema covers organizations, pricing plans, users, roles, doctors, patients, appointments, prescriptions, prescription versions, reports, medicine reminders, catalog items, files, templates, activity logs, notifications, announcements, chat connections/messages, and email templates. Most clinical and operational records carry `organizationId` for tenant scoping.

## 5. What appears implemented

The codebase contains substantial implementation for the following areas:

- Five-role authentication and organization onboarding
- Email verification, password reset, and TOTP 2FA with backup codes
- Doctor/patient/staff/admin dashboards
- Prescription CRUD, version snapshots, attachments, print view, live preview, and public sharing
- Catalog-backed medicine/test entry with custom inline items
- Appointment serial generation, dynamic new/follow-up/report-review fees, and cancellation policy
- Stripe appointment checkout, subscription checkout, webhook handling, demo checkout, and refund attempts
- Public doctor and clinic directories
- Queue polling and public safe-name waiting-room display
- Test report uploads, notifications, chat, reminders, Google Calendar URL generation, audit logging, and PWA shell
- English/Bengali localization and light/dark theme plus five accent palettes

The feature roadmap in `PROJECT_OVERVIEW.md` also identifies several future items, including drug interaction checking, allergy alerts, dose calculation, ICD-10 support, voice dictation, SMS/WhatsApp delivery, telemedicine, vital charts, and offline draft synchronization.

## 6. Validation results

Commands were run from the repository root:

| Check | Result | Evidence |
|---|---|---|
| `npm run lint` | **Failed** | JSX parsing errors in `src/app/clinics/page.tsx`, `src/app/doctors/page.tsx`, `src/app/staff/page.tsx`, and `src/components/dashboard/reception-manager.tsx`; 3 unused-import/constant warnings |
| `npx tsc --noEmit` | **Failed** | Same JSX structure errors propagate into TypeScript diagnostics |
| `npm run build` | **Failed** | Next/Turbopack stopped on the same four files |
| `npx prisma validate` | **Passed** | Prisma schema is valid; Prisma reports that `package.json#prisma` configuration is deprecated for Prisma 7 |
| `git diff --check` | **Passed** | No whitespace errors in the current diff |
| Native select scan | **Passed** | No application `<select>` tags found; matches in the scan were only in `AGENTS.md` |

## 7. Current working-tree condition

At the time of analysis, the checkout was on `main` at commit `a1040ef` and contained **56 modified tracked files plus 7 untracked files**. The changed files include the four files that currently fail parsing. The failure is visible in the current checkout and should be treated as an in-progress or incomplete refactor state until the working-tree owner confirms otherwise.

The specific parse patterns are clear:

- `src/app/clinics/page.tsx`, `src/app/doctors/page.tsx`, and `src/app/staff/page.tsx` contain a duplicated directory section and a second closing `</main>`.
- `src/components/dashboard/reception-manager.tsx` contains a duplicated cancellation button closing/action block around line 2544.

## 8. Important risks and gaps

### Blocking

1. **The production build is currently broken.** The JSX errors prevent lint, typecheck, and Next production compilation from completing.
2. **There is no automated regression suite.** The package has no test script and no discovered test/spec files for this clinical workflow surface.

### High priority review items

1. **Resource-level authorization needs a focused security review.** `src/app/api/prescriptions/[id]/route.ts` checks only that a caller is authenticated, while `getPrescription`, `updatePrescription`, and `deletePrescription` receive only the prescription ID and do not receive the authenticated user context. The same pattern should be checked for appointment and sharing operations. This is a review finding, not a confirmed exploit from this static inspection.
2. **Stripe webhook behavior is fail-open when configuration is incomplete.** `src/app/api/stripe/webhook/route.ts` accepts JSON without signature verification when the webhook secret or signature is absent. Production configuration should make signed verification mandatory.
3. **JWT configuration has a development fallback.** `src/lib/env.ts` uses `dev-secret` when `JWT_SECRET` is missing. A production deployment should fail closed rather than silently use a predictable fallback.
4. **Clinical file uploads lack visible size/type enforcement.** `src/app/api/files/upload/route.ts` reads the entire request into memory and, when Cloudinary is unavailable, writes files into a public static directory. Medical report privacy, upload limits, MIME validation, and access control should be treated as deployment requirements.
5. **Public directory data should be reviewed for privacy.** `src/app/staff/page.tsx` queries public staff records including email and phone fields, and the clinic/doctor directory data also includes contact fields. Confirm that the rendered public UI exposes only intentionally public information.

### Medium priority

1. The rate limiter is documented as in-memory, which does not provide consistent protection across multiple application instances.
2. The public prescription-link flow intentionally exposes prescription-related records when enabled, including attachments and test reports. This should have explicit consent, expiration/revocation, and minimum-data policies.
3. The seed data uses shared demo credentials and realistic-looking medical/clinic records. This is acceptable for a sandbox but must never be treated as production data.
4. The product documentation is split between a concise MVP README and a much broader roadmap/implementation overview. The README lists four roles while the actual schema and implementation include five roles, including `ADMIN`.
5. Prisma configuration should eventually move from the deprecated `package.json#prisma` field to the Prisma 7 configuration format.

## 9. Recommended order of next work

1. Resolve the four JSX parse failures and rerun lint, typecheck, and build.
2. Establish a minimal end-to-end test path for login, role routing, appointment creation, prescription creation, and public sharing.
3. Perform an authorization matrix review using each role and organization boundary, beginning with prescription, appointment, report, file, sharing, and subscription endpoints.
4. Make production security settings fail closed: required JWT secret, mandatory Stripe webhook signatures, upload limits/validation, and private clinical-file access.
5. Consolidate project documentation into one current product/operations guide and one roadmap.

## Bottom line

PPMS is a large, feature-rich clinical SaaS application rather than a simple prescription form. Its strongest areas are breadth of workflow coverage, the Prisma domain model, role-aware dashboards, prescription versioning, queue operations, and bilingual/theme support. Its immediate engineering state is not release-ready because the current working tree does not compile, lacks automated tests, and needs a dedicated authorization/privacy hardening pass before handling real clinical data.
