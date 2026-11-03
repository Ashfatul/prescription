# Patient Prescription Management System (PPMS)

Full-stack Next.js (App Router) application with Prisma + PostgreSQL for managing users, doctor queues, appointments, and prescriptions.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS
- Framer Motion
- JWT auth with role-based access control
- Cloudinary file uploads

## Roles

- SUPER_ADMIN
- DOCTOR
- PATIENT
- STAFF

## Implemented Modules (MVP)

- Authentication and role-aware route protection
- User management with role assignment
- Doctor and patient profile modules
- Appointment booking with per-doctor serial queue
- Live queue endpoint for polling-based serial updates
- Prescription CRUD with medicines/tests/notes
- Template CRUD for prescription layouts
- File upload API (Cloudinary) + file records
- Role-specific dashboards (Admin, Doctor, Patient)
- Print-friendly prescription page
- Light/Dark mode and EN/BN language toggle

## Project Structure

```text
prisma/
	schema.prisma
	seed.ts
src/
	app/
		api/
		auth/login/
		dashboard/
		prescriptions/[id]/print/
	components/
		common/
		dashboard/
		home/
		layout/
	features/
		appointments/
		catalog/
		doctors/
		files/
		patients/
		prescriptions/
		templates/
		users/
	lib/
		auth/
		i18n/
```

## Environment Setup

1. Copy env file:

```bash
cp .env.example .env
```

2. Update `.env` values:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: strong random secret
- `CLOUDINARY_*`: cloudinary credentials for upload API

## Database Setup

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Seed Credentials

- `ashfatul.islam@gmail.com` / `aniyasfather`
- `doctor@ppms.local` / `Pass1234!`
- `patient@ppms.local` / `Pass1234!`
- `staff@ppms.local` / `Pass1234!`

## Secure Demo Database Reset

When Demo Mode is enabled, the Super Admin dashboard exposes a re-authenticated reset action. It requires the Super Admin password, an acknowledgement, and the exact phrase `RESET DEMO DATA`. It removes non-demo users, clinics, and clinical activity while retaining the PPMS Clinic demo accounts plus roles, plans, catalogs, templates, email templates, settings, and translations. The reset also removes all prescriptions.

## Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000`.

## API Overview

- Auth: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/register`
- Users: `/api/users`, `/api/users/:id`
- Doctors: `/api/doctors`, `/api/doctors/:id`, `/api/doctors/:id/queue`
- Patients: `/api/patients`, `/api/patients/:id`
- Appointments: `/api/appointments`, `/api/appointments/:id`
- Prescriptions: `/api/prescriptions`, `/api/prescriptions/:id`
- Catalog: `/api/medicines`, `/api/tests`
- Templates: `/api/templates`
- Files: `/api/files`, `/api/files/upload`
- Stats: `/api/stats`
- Public doctor listing: `/api/public/doctors`

## Security Notes

- JWT cookie is `httpOnly`
- Role checks on protected APIs and dashboards
- Middleware-based route guarding
- Zod validation in service/controller layer
- Global in-memory rate limiter (MVP)

## Production Notes

- **Vercel environment variables:** Add `DATABASE_URL` and `JWT_SECRET` in Vercel under **Project Settings → Environment Variables**. Select **Production** (and **Preview** if preview deployments should work), then redeploy. `DATABASE_URL` must be a hosted PostgreSQL URL; `localhost` or `127.0.0.1` will not work from Vercel.
- **Initialize the production database:** This repository does not currently contain Prisma migration files. After setting the production URL, run `DATABASE_URL="<production-url>" npx prisma db push` from a trusted environment, then optionally run `DATABASE_URL="<production-url>" npm run prisma:seed` for demo data. Use `prisma migrate deploy` once migrations are added.
- **Deploy check:** `npm run build` validates `DATABASE_URL` and `JWT_SECRET` before building. A missing or local-only URL now stops the Vercel build with an actionable message instead of deploying a broken server.
- Replace in-memory rate limiter with Redis/Upstash for multi-instance deployments
- Use signed/private access patterns for sensitive file access
- Add audit logs and structured monitoring
