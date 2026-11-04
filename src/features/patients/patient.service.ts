import { RoleName } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { hashPassword } from "@/lib/auth/password";
import { patientSchema, patientUpdateSchema } from "@/features/patients/patient.schema";
import { logActivity } from "@/features/activity-log/activity-log.service";
import { sendTemplatedEmail } from "@/features/email-templates/email-template.service";

const patientUserSafeSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  imageUrl: true,
  theme: true,
  accent: true,
  roleId: true,
  organizationId: true,
  isApproved: true,
  approvedAt: true,
  approvedBy: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
};

export async function listPatients(organizationId?: string) {
  return db.patient.findMany({
    where: organizationId
      ? {
          OR: [{ organizationId }, { user: { organizationId } }],
        }
      : undefined,
    include: {
      user: {
        select: patientUserSafeSelect,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPatient(input: unknown, organizationId?: string) {
  const data = patientSchema.parse(input);

  let orgId = organizationId;
  let userId = data.userId;

  // Walk-in direct registration
  if (!userId) {
    if (!data.name) {
      throw new AppError("Either userId or patient name is required", 400);
    }

    const patientRole = await db.role.findUnique({
      where: { name: RoleName.PATIENT },
    });
    if (!patientRole) {
      throw new AppError("Patient role not configured", 500);
    }

    const email = data.email || `patient_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@ppms.local`;
    const defaultPass = await hashPassword("patient123");

    const newUser = await db.user.create({
      data: {
        name: data.name,
        email,
        phone: data.phone,
        passwordHash: defaultPass,
        roleId: patientRole.id,
        organizationId: orgId || undefined,
      },
    });

    userId = newUser.id;
  } else if (!orgId) {
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });
    if (existingUser?.organizationId) orgId = existingUser.organizationId;
  }

  // Check if patient record already exists for this user
  const existing = await db.patient.findUnique({
    where: { userId },
    include: {
      user: {
        select: patientUserSafeSelect,
      },
    },
  });

  if (existing) {
    return db.patient.update({
      where: { id: existing.id },
      data: {
        organizationId: orgId || existing.organizationId,
        gender: data.gender || existing.gender,
        medicalHistory: data.medicalHistory || existing.medicalHistory,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : existing.dateOfBirth,
      },
      include: {
        user: {
          select: patientUserSafeSelect,
        },
      },
    });
  }

  return db.patient.create({
    data: {
      userId,
      organizationId: orgId || undefined,
      gender: data.gender,
      medicalHistory: data.medicalHistory,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    },
    include: {
      user: {
        select: patientUserSafeSelect,
      },
    },
  });
}

export async function updatePatient(id: string, input: unknown) {
  const data = patientUpdateSchema.parse(input);
  const existing = await db.patient.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Patient not found", 404);
  }

  return db.patient.update({
    where: { id },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    },
    include: {
      user: {
        select: patientUserSafeSelect,
      },
    },
  });
}

export async function deletePatient(id: string) {
  await db.patient.delete({ where: { id } });
  return { deleted: true };
}

export async function verifyPatient(id: string, verifiedByUserName: string) {
  const patient = await db.patient.findUnique({
    where: { id },
    include: {
      user: true,
      organization: true,
    },
  });

  if (!patient) {
    throw new AppError("Patient record not found", 404);
  }

  const updatedUser = await db.user.update({
    where: { id: patient.userId },
    data: {
      isApproved: true,
      approvedAt: new Date(),
      approvedBy: verifiedByUserName,
    },
    select: patientUserSafeSelect,
  });

  await logActivity({
    organizationId: patient.organizationId || patient.user.organizationId,
    userName: verifiedByUserName,
    userRole: "STAFF",
    action: "PATIENT_VERIFIED",
    entityType: "Patient",
    entityId: patient.id,
    detailsJson: {
      patientName: patient.user.name,
      patientEmail: patient.user.email,
      verifiedBy: verifiedByUserName,
    },
  });

  // Dispatch confirmation email
  if (patient.user.email && !patient.user.email.endsWith("@ppms.local")) {
    const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await sendTemplatedEmail({
      key: "PATIENT_ACCOUNT_VERIFIED",
      to: patient.user.email,
      variables: {
        patientName: patient.user.name,
        clinicName: patient.organization?.name || "Clinical Health Services",
        loginUrl: `${host}/auth/login`,
        appName: process.env.NEXT_PUBLIC_APP_NAME || "CareFlow OS",
        supportEmail: process.env.SUPPORT_EMAIL || "support@ppms.local",
        verifiedBy: verifiedByUserName,
      },
      organizationId: patient.organizationId || patient.user.organizationId,
    }).catch((err) => {
      console.error("Failed to send patient account verification email:", err);
    });
  }

  return {
    ...patient,
    user: updatedUser,
  };
}
