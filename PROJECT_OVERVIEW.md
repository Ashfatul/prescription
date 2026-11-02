# Patient Prescription Management System (PPMS) - Comprehensive Project Overview & Feature Roadmap

A production-grade, multi-tenant clinical operating system and electronic prescription platform designed for independent medical practitioners, polyclinics, and multi-specialty hospitals.

---

## 1. System Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) + React 19 + TypeScript | High-performance server-side rendering, streaming, and API routes |
| **Styling & Design** | Tailwind CSS v4 + Semantic CSS Variables | Design-token-driven UI with 5 dynamic accent themes & strict Dark/Light modes |
| **Database & ORM** | PostgreSQL + Prisma ORM | Relational schema with role-based models, version snapshots, and indexing |
| **Authentication** | JWT HTTP-Only Cookies (`ppms_session`) | Zero-leak role-based access control (`SUPER_ADMIN`, `ADMIN`, `DOCTOR`, `STAFF`, `PATIENT`) |
| **Payments & SaaS** | Stripe Checkout + Webhooks | Subscription lifecycle management, trial countdowns, and plan tier gating |
| **Storage & Media** | Cloudinary API + Local Relational Metadata | Clinical diagnostic reports, doctor digital signatures, and patient avatar hosting |

---

## 2. Currently Implemented Features

### 2.1 Authentication & Multi-Role Access Control (RBAC)
- [x] **5-Tier Role System**: `SUPER_ADMIN` (Platform wide), `ADMIN` (Clinic / Hospital wide), `DOCTOR` (Chamber & Clinical), `STAFF` (Reception & Triage), `PATIENT` (Personal Health Portal).
- [x] **Multi-Tenant Organization Isolation**: Scopes clinics, staff, patients, and financial metrics by `organizationId`.
- [x] **Instant Demo Evaluation Profiles**: 1-click test authorization buttons on `/auth/login` for all 5 roles (`Super Admin`, `Clinic Admin`, `Doctor`, `Staff`, `Patient`).
- [x] **Email Verification & Password Reset Flows**: Tokenized verification links with configurable expiration and secure password hashing (`bcryptjs`).
- [x] **Protected Server & Client Route Guards**: Automatic redirection based on user credentials and roles via middleware and session cookies.

### 2.2 Doctor Clinical Workspace & Prescription Writer
- [x] **Fast Prescribing with 1-Click Clinical Chips**:
  - Quick chips for Chief Complaints (*Fever x 3 days*, *Throat pain*, *Epigastric distress*).
  - Quick chips for Common Diagnoses (*Acute Gastritis*, *Upper Respiratory Infection*, *Hypertension*).
  - Quick chips for Dose Frequencies (`1+0+1`, `1+1+1`, `0+0+1`, `1+0+0`) and Durations (`3 days`, `7 days`, `14 days`, `1 month`).
  - Quick chips for Lifestyle & Clinical Advice (*Drink warm water*, *Avoid oily foods*, *Complete bed rest*).
- [x] **Searchable Drug Catalog with Auto-Fill**:
  - Connected to medicine catalog (`/api/medicines`).
  - Selecting a brand (e.g. *Maxpro 20mg*) automatically populates Form (*Capsule*), Strength (*20mg*), Dose (*1+0+1*), Timing (*30m before meal*), and Duration (*14 days*).
- [x] **Custom In-Line Medicine & Test Creation**: Doctors can insert ad-hoc medicines or lab investigations on the fly without exiting the prescribing workflow.
- [x] **Prescription Versioning & Audit Trail**:
  - Full revision history tracking with snapshots (`PrescriptionVersion`).
  - Doctors can amend existing prescriptions while preserving historical timestamps and `changeReason`.
- [x] **Multi-Page A4 Print Engine (`/prescriptions/[id]/print`)**:
  - Automated page calculation and multi-page pagination.
  - Repeated clinic header (hospital name, address, phone) and doctor credentials (BMDC registration, degrees).
  - Top patient demographic bar and bottom legal signature block on every page.
- [x] **Live Prescription Preview Modal**: True-to-life A4 overlay replicating exact printed output before saving.
- [x] **Vitals & Clinical Info Recording**: Blood Pressure, Pulse, Weight, Temperature, Blood Sugar, SpO2, and Past Medical History.

### 2.3 Chamber Queue & Appointment Management
- [x] **Comprehensive Pre-Consultation Clinical Intake (`ClinicalIntakeForm`)**:
  - Unified across patient self-booking (`AppointmentBookingModal`) and receptionist triage (`ReceptionManager`).
  - **Chronic Medical History**: 1-click chips for Diabetes (Type 1 & 2), Hypertension, Asthma/COPD, Chronic Kidney Disease, Heart Disease/IHD, Thyroid, Gastritis/PUD, Stroke, Liver Disease, Cancer, etc., plus custom disease inputs.
  - **Allergies & Drug Sensitivities**: High-alert tracking for Penicillin, Sulfa drugs, NSAIDs/Aspirin, Cephalosporins, Paracetamol, Latex, Food Allergies (Seafood, Peanuts, Eggs), etc., plus custom allergen inputs.
  - **Critical Clinical Flags**: Warnings for blood thinners/anticoagulants, active pregnancy, breastfeeding, pacemaker/implants, recent surgery (< 6 months), bleeding disorders, and tobacco/alcohol use.
  - **Diet Control & Dietary Guidance**: Medical dietary controls (Low Sugar/Diabetic, Low Sodium/DASH, Low Fat, Renal Diet, High Fiber, Soft/Liquid, Gluten-Free, Fluid Restriction) with custom dietary notes.
- [x] **Dynamic Multi-Tier Doctor Fees & Visiting Policy**:
  - **New Patient First Visit Fee**: Standard consultation charge configured per doctor.
  - **Returning Patient Follow-up Rate**: Configurable follow-up fee valid up to 3 months (90 days). Automatically verifies that the patient has a qualifying previous prescription or completed visit with that specialist.
  - **Free Diagnostic Report Review**: Configurable free window (e.g. 2 days after first consultation) where returning to show lab/diagnostic reports has a **$0.00** fee.
  - **All Controlled from Doctor Profile**: Doctors configure their new patient fee, follow-up fee, validity period, and free report days directly from `/dashboard/doctor` (`DoctorProfileEditor`). No static prices.
  - **Live Dynamic Fee Display**: Shown on all doctor cards (`/doctors`) and doctor profile pages (`/doctors/[id]`).
- [x] **Stripe Payment Processing for Doctor Visits**:
  - Integrated Stripe Checkout sessions for paid doctor consultations (`$50`, `$30`).
  - Seamless redirection to Stripe payment gateway, with automated appointment confirmation webhook and payment verification endpoint (`/api/appointments/[id]/verify-payment`).
  - Instant `$0` confirmation for Free Report Reviews without requiring card details.
  - Reception Desk Payment Modes: Staff can collect via Cash, Card/POS terminal, or record a Doctor Waived visit.
- [x] **Doctor Serial Queue Engine**: Automatic daily serial assignment (`#1`, `#2`, `#3`...) for booked consultations.
- [x] **Live Consultation Serial Caller**: Doctor dashboard controls to advance calling queue in real-time.
- [x] **Hospital Waiting Room TV Display (`/live-queue`)**:
  - Distraction-free, high-contrast digital signage interface built specifically for clinic lobby monitors and TV screens.
  - Auto-cycling carousel with countdown timer (15s per doctor) and manual pause/resume/navigate controls.
  - Giant token calling display showing **Now Consulting: Token #{serial}**, chamber room number, previous patient, and next in lobby.
  - Dedicated Missed/Skipped Serials board with reception triage check-in instructions.
  - Fullscreen display toggle (`⛶ Fullscreen Display Mode`) and live digital wall clock.
  - Strict read-only kiosk architecture (queue advancement is strictly managed via doctor/staff clinical portals).
- [x] **Patient Privacy Safeguards (Safe Name Masking)**: Public waiting room monitors and TV displays mask patient identities (e.g., *Tariqul I.*) and never expose private contact numbers, emails, or medical complaints.
- [x] **Doctor Chamber Live Status Widget (`/doctors/[id]`)**:
  - Real-time chamber turn metrics showing current calling serial, next patient, previous patient, and missed serials for that specific specialist.
  - Direct navigation jump to the clinic-wide fullscreen waiting room TV display.
- [x] **Reception Walk-in Triage (`/dashboard/staff`)**:
  - 1-click walk-in ticket issuing for unbooked patients.
  - Printable token slip generator with serial number, QR code, and chamber instructions.
- [x] **Staff Scheduling Manager**: Toggle doctor chamber availability and customize visiting schedules.
- [x] **Public Directory & Booking Flow (`/doctors` & `/doctors/[id]`)**:
  - Patient specialist lookup with specialization filters.
  - Direct chamber appointment booking modal with real-time slot checking.

### 2.4 Patient Portal (`/dashboard/patient`)
- [x] **Prescription Vault**: Chronological consultation history with version selector and instant A4 printing.
- [x] **Public Prescription Link & QR Code Sharing**:
  - Generate shareable URLs (`/p/[token]`) with toggleable privacy settings.
  - Scannable QR code generation for pharmacies or second-opinion specialists.
- [x] **Diagnostic Test Report Uploads**: Patients can upload PDF/Image lab reports directly for doctor review.
- [x] **Medicine Dosage Reminders**:
  - Automated reminder generation derived from prescribed dosage schedules.
  - 1-click **Add to Google Calendar** integration with medication timing alerts.
- [x] **Doctor-Patient Consultation Chat**: Asynchronous direct messaging thread with doctor approval requirement.
- [x] **Notification Center**: In-app notifications for Rx creation, test report reviews, and appointments.

### 2.5 Admin & Organization Management (`/dashboard/admin`)
- [x] **Clinical Operations Dashboard**: Real-time stats on appointments, active prescriptions, revenue, and active specialists.
- [x] **User Management Hub**: Create, edit, and assign roles (`DOCTOR`, `STAFF`, `PATIENT`, `ADMIN`) with clinic organization scoping.
- [x] **Medicine & Lab Test Catalog Manager**: Master formulary hub for adding generic drugs, brand names, and diagnostic test profiles.
- [x] **Role-Targeted Announcement System**: Broadcast high-priority banners targeted to `ALL`, `DOCTOR`, `STAFF`, or `PATIENT`.
- [x] **System Email Templates Studio**: Interactive template editor with dynamic merge tags (`{{doctorName}}`, `{{patientName}}`, `{{shareUrl}}`) and test delivery.
- [x] **HIPAA & Audit Activity Logs**: Immutable chronological record of system events (`PRESCRIPTION_CREATED`, `TEST_REPORT_UPLOADED`, etc.).
- [x] **SaaS Subscription Lifecycle**: Stripe customer checkout, trial countdown banner, plan tiers (`Starter Clinic`, `Professional Polyclinic`, `Enterprise`).

### 2.6 Visual Architecture & UI Ergonomics
- [x] **Design Tokens**: Standardized semantic color tokens (`--bg-app`, `--bg-surface`, `--brand-primary`, etc.).
- [x] **5 Dynamic Accent Themes**: `teal` (default clinical), `blue`, `indigo`, `rose`, `slate`.
- [x] **Flawless Light & Dark Mode**: Persistent theme selection without jarring visual contrast issues.
- [x] **Multilingual Support**: English & Bengali (বাংলা) interface localization toggle.

---

## 3. Recommended & Potential Feature Extensions

The following features represent high-value enhancements for clinical workflows, revenue generation, and medical safety.

### 3.1 Medical Safety & Clinical Decision Support (High Priority)
1. **Drug-Drug Interaction (DDI) Warning System**:
   - Automatic cross-reference check when adding medications (e.g. flagging NSAID + ACE inhibitor or Warfarin + Aspirin).
   - Visual alert badges: *Severe*, *Moderate*, *Minor* with clinical guidance.
2. **Patient Drug Allergy Cross-Checking**:
   - Record drug allergies (e.g., *Penicillin*, *Sulfa*, *Ciprofloxacin*) on patient profiles.
   - Automatically block or warn doctors if a prescribed medicine belongs to an allergenic class.
3. **Pediatric & Geriatric Dose Calculation Assistant**:
   - Automated dose calculator based on patient weight (mg/kg/day) and age for pediatric patients.
   - Renal dosage adjustment alerts based on patient serum creatinine / eGFR.
4. **ICD-10 Diagnostic Coding Assistant**:
   - Searchable ICD-10 diagnostic library with auto-suggestions matching Chief Complaints.

### 3.2 AI & Clinical Voice Ergonomics
5. **Voice-to-Prescription Clinical Dictation**:
   - Speech-to-text dictation using Web Speech API or Whisper model for hands-free typing of Complaints, Findings, and Advice.
6. **AI Clinical Summary & Follow-Up Generator**:
   - Summarize multi-year patient consultation histories into a 1-paragraph clinical briefing for doctors before entering the chamber.
   - 1-click patient discharge / follow-up instruction translator into simplified layman's language.

### 3.3 Patient Communications & Telemedicine
7. **Direct WhatsApp & SMS Prescription Delivery**:
   - Integrate SMS gateway (Twilio / SSL Wireless / Greenweb) to dispatch SMS with short Rx link upon prescription completion.
   - Send WhatsApp notification with embedded PDF attachment directly to patient mobile numbers.
8. **Automated SMS Chamber Reminders**:
   - Automated SMS dispatched 2 hours before scheduled consultation serial time with live queue position.
9. **Integrated WebRTC Video Telemedicine**:
   - In-app 1-on-1 encrypted video calling between doctor and patient with side-by-side prescription writing screen.
   - Virtual waiting room where doctor can admit patients one at a time.

### 3.4 Financial & E-Pharmacy Workflows
10. **Consultation Fee Payment Gateway (bKash, Nagad, Cards)**:
    - Allow patients to pay consultation fees online before appointment confirmation.
    - Automated digital money receipt generation for clinic accounts.
11. **E-Pharmacy Order Dispatch / Fulfillment**:
    - Direct "Send to Partner Pharmacy" button on patient portal for home medicine delivery.
    - Pharmacy partner portal to view digitized prescriptions and process fulfillment.
12. **Doctor Referral Commission & Accounts Ledger**:
    - Track diagnostic test referrals and doctor chamber earnings reports.

### 3.5 Diagnostic & Clinical Visualizations
13. **Patient Vital Trend Charts & Graphs**:
    - Visual timeline graphs for Blood Pressure, Blood Glucose, Weight/BMI, and SpO2 across consecutive visits.
14. **Abnormal Lab Value Auto-Highlighting**:
    - Diagnostic test reports auto-parse numerical values and highlight out-of-range biomarkers (e.g. HbA1c > 6.5%).
15. **Digital Anatomy Annotation Canvas**:
    - Interactive human body / dental / dermatological diagram where doctors can draw markings or circle lesion locations.

### 3.6 Offline Capability & Clinic Operations
16. **Offline-First PWA (Progressive Web App)**:
    - Service worker caching and local IndexedDB draft storage allowing doctors to write prescriptions during clinic internet outages.
    - Automatic background sync when connectivity resumes.
17. **Multi-Branch Chamber Management**:
    - Support visiting doctors who rotate between multiple clinics or hospital branches across the week.
18. **Complete Patient Health Dossier Export (PDF/ZIP)**:
    - 1-click export of patient's full medical records, past prescriptions, and lab tests for insurance or travel abroad.

---

## 4. Feature Implementation Matrix

| Module | Feature Name | Clinical Value | Complexity | Status |
| :--- | :--- | :---: | :---: | :---: |
| **Prescriptions** | 1-Click Clinical Presets & Chips | Critical | Medium | **Implemented** |
| **Prescriptions** | Catalog Auto-Fill (Dose/Duration) | Critical | Low | **Implemented** |
| **Prescriptions** | Multi-Page A4 Pagination Engine | Critical | High | **Implemented** |
| **Prescriptions** | Revision History & Versioning | High | Medium | **Implemented** |
| **Prescriptions** | Drug-Drug Interaction Checker | High | High | *Suggested* |
| **Prescriptions** | Patient Allergy Alert Guard | Critical | Medium | *Suggested* |
| **Prescriptions** | Pediatric Weight-Based Dose Calc | High | Medium | *Suggested* |
| **Queue & Triage** | Live Serial Chamber Dispenser | Critical | Medium | **Implemented** |
| **Queue & Triage** | Staff Walk-in Ticket Printer | High | Low | **Implemented** |
| **Queue & Triage** | Automated SMS Serial Countdown | High | Low | *Suggested* |
| **Communication** | WhatsApp / SMS Rx Dispatch | High | Medium | *Suggested* |
| **Communication** | Doctor-Patient Chat Portal | Medium | Medium | **Implemented** |
| **Communication** | Integrated Video Telemedicine | High | High | *Suggested* |
| **AI / Voice** | Voice Dictation (Speech to Rx) | High | Medium | *Suggested* |
| **AI / Voice** | AI Consultation Summary | Medium | Low | *Suggested* |
| **Patient Care** | Google Calendar Medicine Sync | High | Low | **Implemented** |
| **Patient Care** | Vital History Trend Charts | High | Medium | *Suggested* |
| **Billing & SaaS** | Stripe Multi-Tier Subscriptions | Critical | High | **Implemented** |
| **Billing & SaaS** | bKash/Nagad Patient Fee Collection | High | Medium | *Suggested* |
| **Operations** | Multi-Branch Rotating Chamber | Medium | Medium | *Suggested* |
| **Operations** | Offline PWA Emergency Mode | High | High | *Suggested* |
