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

- `admin@ppms.local` / `Pass1234!`
- `doctor@ppms.local` / `Pass1234!`
- `patient@ppms.local` / `Pass1234!`
- `staff@ppms.local` / `Pass1234!`

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

- Replace in-memory rate limiter with Redis/Upstash for multi-instance deployments
- Use signed/private access patterns for sensitive file access
- Add audit logs and structured monitoring
