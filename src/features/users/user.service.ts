import crypto from "crypto";
import { RoleName } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { hashPassword } from "@/lib/auth/password";
import { createUserSchema, userPreferencesSchema, updateUserSchema } from "@/features/users/user.schema";
import { logActivity } from "@/features/activity-log/activity-log.service";
import { isEmailVerificationRequired, isPatientVerificationRequired } from "@/features/settings/settings.service";
import { sendTemplatedEmail } from "@/features/email-templates/email-template.service";

export async function listUsers(organizationId?: string) {
  return db.user.findMany({
    where: organizationId ? { organizationId } : undefined,
    include: { role: true, doctor: true, patient: true, organization: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createUser(input: unknown, creatorUserId?: string) {
  const data = createUserSchema.parse(input);
  const role = await db.role.findUnique({ where: { name: data.role } });
  if (!role) {
    throw new AppError("Role not found", 404);
  }

  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError("Email already exists", 409);
  }

  // Provisioned accounts inherit the creator's clinic. Never fall back to another tenant.
  let orgId = data.organizationId;
  if (creatorUserId) {
    const creator = await db.user.findUnique({
      where: { id: creatorUserId },
      select: { organizationId: true, role: true },
    });
    if (creator?.organizationId) {
      orgId = creator.organizationId;
    }
  }
  if (!orgId) {
    const requiresClinic =
      data.role === RoleName.ADMIN ||
      data.role === RoleName.DOCTOR ||
      data.role === RoleName.STAFF ||
      data.role === RoleName.PATIENT;
    if (requiresClinic) {
      throw new AppError("A clinic must be selected before creating this account.", 400);
    }
  }

  if (
    orgId &&
    (data.role === RoleName.DOCTOR || data.role === RoleName.STAFF || data.role === RoleName.PATIENT)
  ) {
    const organization = await db.organization.findUnique({
      where: { id: orgId },
      select: {
        plan: {
          select: {
            maxDoctors: true,
            maxStaff: true,
            maxPatients: true,
          },
        },
      },
    });
    const limit = data.role === RoleName.DOCTOR
      ? organization?.plan?.maxDoctors
      : data.role === RoleName.STAFF
      ? organization?.plan?.maxStaff
      : organization?.plan?.maxPatients;

    if (limit !== null && limit !== undefined) {
      const currentCount = await db.user.count({
        where: { organizationId: orgId, role: { name: data.role } },
      });
      if (currentCount >= limit) {
        throw new AppError(
          `Your current plan allows a maximum of ${limit} ${data.role.toLowerCase()} accounts. Upgrade your plan to add another account.`,
          403
        );
      }
    }
  }

  const requireVerification = await isEmailVerificationRequired();
  const shouldRequireVerification = requireVerification;
  const verificationToken = shouldRequireVerification ? crypto.randomBytes(32).toString("hex") : null;
  const verificationExpiresAt = shouldRequireVerification ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

  const isPatient = data.role === RoleName.PATIENT;
  const isSelfRegistration = !creatorUserId;
  const requirePatientVerification = isPatient && isSelfRegistration ? await isPatientVerificationRequired(orgId || undefined) : false;

  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: await hashPassword(data.password),
      phone: data.phone,
      imageUrl: data.imageUrl,
      signatureUrl: data.signatureUrl,
      roleId: role.id,
      organizationId: orgId,
      isApproved: !requirePatientVerification,
      approvedAt: !requirePatientVerification ? new Date() : null,
      approvedBy: !requirePatientVerification && creatorUserId ? creatorUserId : null,
      emailVerified: shouldRequireVerification ? null : new Date(),
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiresAt: verificationExpiresAt,
    },
    include: { role: true, organization: true },
  });

  if (data.role === RoleName.DOCTOR) {
    await db.doctor.create({
      data: {
        userId: user.id,
        organizationId: orgId || undefined,
        specialization: data.specialization || "General Medicine",
        degrees: data.degrees,
        designation: data.designation,
        hospital: data.hospital || user.organization?.name,
        bmdcRegNo: data.bmdcRegNo,
        chamberAddress: data.chamberAddress,
        contactNumber: data.contactNumber || data.phone,
        visitingHours: data.visitingHours,
      },
    });

    await logActivity({
      organizationId: orgId,
      userId: creatorUserId || user.id,
      userName: user.name,
      userRole: "DOCTOR",
      action: "DOCTOR_CREATED",
      entityType: "Doctor",
      entityId: user.id,
      detailsJson: {
        name: user.name,
        specialization: data.specialization || "General Medicine",
        email: user.email,
      },
    });
  }

  if (data.role === RoleName.STAFF) {
    await logActivity({
      organizationId: orgId,
      userId: creatorUserId || user.id,
      userName: user.name,
      userRole: "STAFF",
      action: "STAFF_CREATED",
      entityType: "User",
      entityId: user.id,
      detailsJson: { name: user.name, email: user.email },
    });
  }

  if (data.role === RoleName.PATIENT) {
    await db.patient.create({
      data: {
        userId: user.id,
        organizationId: orgId || undefined,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        medicalHistory: data.medicalHistory,
      },
    });

    await logActivity({
      organizationId: orgId,
      userId: creatorUserId || user.id,
      userName: user.name,
      userRole: "PATIENT",
      action: "PATIENT_REGISTERED",
      entityType: "Patient",
      entityId: user.id,
      detailsJson: { name: user.name, email: user.email, gender: data.gender },
    });
  }

  if (shouldRequireVerification && verificationToken) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await sendTemplatedEmail({
      key: "EMAIL_VERIFICATION",
      to: user.email,
      variables: {
        userName: user.name,
        userEmail: user.email,
        verifyUrl: `${appUrl}/auth/verify-email?token=${verificationToken}`,
        token: verificationToken,
        appName: process.env.NEXT_PUBLIC_APP_NAME || "CareFlow",
      },
      organizationId: user.organizationId,
    });
  }

  return db.user.findUnique({
    where: { id: user.id },
    include: { role: true, doctor: true, patient: true, organization: true },
  });
}

export async function getUserById(id: string) {
  const user = await db.user.findUnique({
    where: { id },
    include: { role: true, doctor: true, patient: true, organization: true },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}

export async function updateUser(id: string, input: unknown) {
  const data = updateUserSchema.parse(input);

  const existing = await db.user.findUnique({
    where: { id },
    include: { role: true },
  });

  if (!existing) {
    throw new AppError("User not found", 404);
  }

  let roleId = existing.roleId;
  if (data.role) {
    const role = await db.role.findUnique({ where: { name: data.role } });
    if (!role) {
      throw new AppError("Role not found", 404);
    }
    roleId = role.id;
  }

  const updated = await db.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      imageUrl: data.imageUrl,
      signatureUrl: data.signatureUrl !== undefined ? data.signatureUrl : undefined,
      organizationId: data.organizationId !== undefined ? data.organizationId : undefined,
      roleId,
      passwordHash: data.password ? await hashPassword(data.password) : undefined,
    },
    include: { role: true, doctor: true, patient: true, organization: true },
  });

  if (updated.doctor && (data.specialization || data.degrees || data.bmdcRegNo)) {
    await db.doctor.update({
      where: { id: updated.doctor.id },
      data: {
        specialization: data.specialization !== undefined ? data.specialization : updated.doctor.specialization,
        degrees: data.degrees !== undefined ? data.degrees : updated.doctor.degrees,
        bmdcRegNo: data.bmdcRegNo !== undefined ? data.bmdcRegNo : updated.doctor.bmdcRegNo,
        chamberAddress: data.chamberAddress !== undefined ? data.chamberAddress : updated.doctor.chamberAddress,
        visitingHours: data.visitingHours !== undefined ? data.visitingHours : updated.doctor.visitingHours,
      },
    });
  }

  return updated;
}

export async function deleteUser(id: string) {
  const user = await db.user.findUnique({
    where: { id },
    include: { role: true, doctor: true, patient: true },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.doctor) {
    const hasPrescriptions = await db.prescription.count({ where: { doctorId: user.doctor.id } });
    if (hasPrescriptions > 0) {
      throw new AppError("Cannot delete physician who has authored active clinical prescriptions.", 400);
    }
    await db.appointment.deleteMany({ where: { doctorId: user.doctor.id } });
    await db.doctor.delete({ where: { id: user.doctor.id } });
  }

  if (user.patient) {
    const hasPrescriptions = await db.prescription.count({ where: { patientId: user.patient.id } });
    if (hasPrescriptions > 0) {
      throw new AppError("Cannot delete patient who has active prescription medical records.", 400);
    }
    await db.appointment.deleteMany({ where: { patientId: user.patient.id } });
    await db.patient.delete({ where: { id: user.patient.id } });
  }

  // Unlink or remove templates created by user
  await db.prescription.updateMany({
    where: { template: { createdById: id } },
    data: { templateId: null },
  });
  await db.template.deleteMany({ where: { createdById: id } });

  // Remove attachments and files uploaded by user
  await db.prescriptionAttachment.deleteMany({
    where: { file: { uploadedById: id } },
  });
  await db.file.deleteMany({ where: { uploadedById: id } });

  await db.user.delete({ where: { id } });
  return { deleted: true };
}

export async function updateUserPreferences(userId: string, input: unknown) {
  const data = userPreferencesSchema.parse(input);
  return db.user.update({
    where: { id: userId },
    data: {
      ...(data.theme ? { theme: data.theme } : {}),
      ...(data.accent ? { accent: data.accent } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      theme: true,
      accent: true,
    },
  });
}
